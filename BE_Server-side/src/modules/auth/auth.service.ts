import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { Role } from "@prisma/client";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ConfigService } from "@nestjs/config";
import { TokenDto } from "./dto/token.dto";
import { UsersService } from "../users/users.service";
import { authenticator } from "otplib";
import { AuditService } from "../audit/audit.service";
import { Request } from "express";


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private auditService: AuditService
    ) {}
    

    async register(data: RegisterDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const  user = await this.usersService.createUser(
            {
                ...data,
                password: hashedPassword,
                role: data.role ?? Role.USER , // Default to USER role if not provided
            }
        );

        console.log(user.email, " Register sucessfully!")
        return user;
    }


    async login(loginData: LoginDto, req?: Request) {
        const ip = req?.ip || req?.connection?.remoteAddress;
        const userAgent = req?.headers['user-agent'];
        const requestId = (req as any)?.requestId;

        try {
            const user = await this.usersService.findUserByEmail(loginData.email);

            if (!user) {
                await this.auditService.logLogin(0, loginData.email, false, requestId, ip, userAgent, 'Email not found');
                throw new NotFoundException('Email is not founded');
            }

            const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
            if( !isPasswordValid){
                await this.auditService.logLogin(user.id, user.email, false, requestId, ip, userAgent, 'Invalid password');
                throw new UnauthorizedException('Password is incorrect');
            }

            if (user.isTwoFactorEnabled) {
                if (!user.totpSecret) {
                    throw new BadRequestException('Two-factor authentication is misconfigured for this account');
                }
                if (!loginData.totpCode) {
                    await this.auditService.logLogin(user.id, user.email, false, requestId, ip, userAgent, '2FA code required');
                    throw new UnauthorizedException('Two-factor code is required');
                }
                const isTotpValid = authenticator.verify({ token: loginData.totpCode, secret: user.totpSecret });
                if (!isTotpValid) {
                    await this.auditService.logLogin(user.id, user.email, false, requestId, ip, userAgent, 'Invalid 2FA code');
                    throw new UnauthorizedException('Invalid two-factor code');
                }
            }
            console.log(user.email, " Login sucessfully!")

            const payload = {
                id : user.id,
                name: user.name,
                email: user.email,
                role : user.role
            }

            const tokens = await this.getTokens(payload);

            await this.saveRefreshToken(user.id, tokens.refresh_token);

            // Log successful login
            await this.auditService.logLogin(user.id, user.email, true, requestId, ip, userAgent);

            return tokens;
        } catch (error) {
            throw error;
        }
    }



    async refreshTokens(refreshToken: string, req?: Request){
        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token is required");
        }

        const refreshSecret = this.configService.get<string>("REFRESH_SECRET");
        try{
            const payload = await this.jwtService.verifyAsync<TokenDto>(refreshToken, {
                secret : refreshSecret,
            });

            const user = await this.usersService.findUserById(payload.id);
            if (!user || !user.hashedRt) {
                throw new UnauthorizedException("Access denied");
            }

            const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRt);
            if (!isRefreshTokenValid) {
                throw new UnauthorizedException("Access denied");
            }

            const tokenDto: TokenDto = {
                id : user.id,
                name : user.name, 
                email : user.email, 
                role : user.role
            };

            const tokens = await this.getTokens(tokenDto);
            await this.saveRefreshToken(user.id, tokens.refresh_token);

            return tokens;

        } catch {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    private async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.usersService.updateUser(userId, { hashedRt: hash });
    }

    async getTokens(payload: TokenDto){
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                payload, 
                {
                    expiresIn: '15m',
                    secret: this.configService.get<string>("JWT_SECRET"),
                },
            ),
            this.jwtService.signAsync(
                payload, 
                {
                    expiresIn: '7d',
                    secret: this.configService.get<string>("REFRESH_SECRET"),
                },
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        }
    }
    
    async generateTwoFactorSecret(userId: number) {
        const user = await this.usersService.findUserById(userId);
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.email, 'WebTechnology', secret);

        await this.usersService.updateUser(userId, {
            totpSecret: secret,
            isTwoFactorEnabled: false,
        });

        return { secret, otpauthUrl };
    }

    async enableTwoFactor(userId: number, code: string) {
        const user = await this.usersService.findUserById(userId);
        if (!user.totpSecret) {
            throw new BadRequestException('2FA secret not generated');
        }

        const isValid = authenticator.verify({ token: code, secret: user.totpSecret });
        if (!isValid) {
            throw new UnauthorizedException('Invalid two-factor code');
        }

        await this.usersService.updateUser(userId, { isTwoFactorEnabled: true });
        return { message: 'Two-factor authentication enabled' };
    }

    async disableTwoFactor(userId: number) {
        await this.usersService.updateUser(userId, { isTwoFactorEnabled: false, totpSecret: null });
        return { message: 'Two-factor authentication disabled' };
    }

    async logout(userId: number, req?: Request) {
        const ip = req?.ip || req?.connection?.remoteAddress;
        const requestId = (req as any)?.requestId;

        // Clear refresh token
        await this.usersService.updateUser(userId, { hashedRt: null });

        // Log logout event
        await this.auditService.logLogout(userId, requestId, ip);

        return { message: 'Logged out successfully' };
    }

    async googleLogin(googleUser: any) {
        // googleUser = { email, name, providerId, provider, avatar }
        console.log("🔍 Google login attempt for:", googleUser.email);
        console.log("📦 Google user data:", JSON.stringify(googleUser, null, 2));

        if (!googleUser.email) {
            throw new UnauthorizedException('Email is required from Google OAuth');
        }

        try {
            const user = await this.usersService.findUserByEmail(googleUser.email);
            console.log("🔍 Found existing user:", user ? "Yes" : "No");

            let finalUser;

            // Nếu user chưa có → tạo user mới (không có mật khẩu vì login bằng Google)
            if (!user) {
                const userData: any = {
                    email: googleUser.email,
                    name: googleUser.name || null,
                    role: Role.USER,
                    provider: googleUser.provider || 'google',
                    providerId: googleUser.providerId || null,
                    avatar: googleUser.avatar || null,
                };
                
                // Không truyền password field - Prisma sẽ dùng default ""
                
                console.log("📝 Creating new user with data:", JSON.stringify(userData, null, 2));
                finalUser = await this.usersService.createUser(userData);
                console.log("✅ User created with Google:", finalUser.email, "ID:", finalUser.id);
            } else {
                // Nếu user đã tồn tại, cập nhật thông tin OAuth nếu chưa có
                if (!user.provider || !user.providerId) {
                    console.log("🔄 Updating OAuth info for existing user");
                    finalUser = await this.usersService.updateUser(user.id, {
                        provider: googleUser.provider || 'google',
                        providerId: googleUser.providerId || null,
                        avatar: googleUser.avatar || user.avatar || null,
                    });
                    console.log("✅ User OAuth info updated:", finalUser.email);
                } else {
                    finalUser = user;
                    console.log("✅ User already exists with OAuth:", finalUser.email);
                }
            }

            // Tạo payload JWT
            const payload: TokenDto = {
                id: finalUser.id,
                name: finalUser.name,
                email: finalUser.email,
                role: finalUser.role,
            };

            // Generate access & refresh token
            const tokens = await this.getTokens(payload);
            await this.saveRefreshToken(finalUser.id, tokens.refresh_token);
            console.log("🎫 Tokens generated successfully for:", finalUser.email);
            return tokens;
        } catch (error) {
            console.error("❌ Error in googleLogin:", error);
            throw error;
        }
    }
}