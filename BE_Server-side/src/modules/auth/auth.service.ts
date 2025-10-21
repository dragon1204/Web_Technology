import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import * as bcrypt from 'bcryptjs';
import { Role } from "@prisma/client";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ConfigService } from "@nestjs/config";
import { TokenDto } from "./dto/token.dto";


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
}