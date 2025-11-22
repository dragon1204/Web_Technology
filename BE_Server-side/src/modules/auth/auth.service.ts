import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { Role } from "@prisma/client";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ConfigService } from "@nestjs/config";
import { TokenDto } from "./dto/token.dto";
import { UsersService } from "../users/users.service";


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
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


    async login(loginData: LoginDto) {
        const user = await this.usersService.findUserByEmail(loginData.email);

        if (!user) {
            throw new NotFoundException('Email is not founded');
        }

        const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
        if( !isPasswordValid){
            throw new UnauthorizedException('Password is incorrect');
        }
        console.log(user.email, " Login sucessfully!")

        const payload = {
            id : user.id,
            name: user.name,
            email: user.email,
            role : user.role
        }

        const tokens = await this.getTokens(payload);

        return tokens;
    }



    async refreshTokens(refresh_token : string){
        const refresh_secret = this.configService.get<string>("REFRESH_SECRET");
        try{
            const payload = await this.jwtService.verifyAsync(refresh_token, {
                secret : refresh_secret,
            })
            
            const tokenDto = {
                id : payload.id,
                name : payload.name, 
                email : payload.email, 
                role : payload.role
            }

            console.log(tokenDto)

            return this.getTokens(tokenDto);

        } catch {
            throw new UnauthorizedException("Invalid refresh token")
        }
    }

    // async updateRtHash(userId: number, rt: string): Promise<void> {
    //     const hash = await argon.hash(rt);
    //     await this.prisma.user.update({
    //         where: {
    //             id: userId,
    //         },
    //         data: {
    //             hashedRt: hash,
    //         },
    //      });
    // }

    async getTokens(payload: TokenDto){
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                payload, 
                {
                    expiresIn: 30,
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
            console.log("🎫 Tokens generated successfully for:", finalUser.email);
            return tokens;
        } catch (error) {
            console.error("❌ Error in googleLogin:", error);
            throw error;
        }
    }
}