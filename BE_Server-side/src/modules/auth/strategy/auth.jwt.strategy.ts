import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private usersService: UsersService,
        private configService: ConfigService

    ) {
        const jwtSecret = configService.get<string>("JWT_SECRET");
        if (!jwtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        }); 
    }

    async validate( payload: any){
        const user = await this.usersService.findUserByEmail(payload.email);

        if(!user) {
            throw new UnauthorizedException('User not found');
        }
        else{
            console.log("User is requesting: ", user.email);
        }
        return user;
    }
}

