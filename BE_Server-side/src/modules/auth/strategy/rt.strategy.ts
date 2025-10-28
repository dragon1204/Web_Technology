import { Injectable} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private usersService: UsersService,
                        configService: ConfigService
    ) {
        const rtSecret = configService.get<string>("REFRESH_SECRET");
        if (!rtSecret) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: rtSecret,
            passReqToCallback: true, // Allows us to access the request object
        }); 
    }

    async validate(req: Request,payload: any){
        const refreshToken = req.get('Authorization')?.replace('Bearer ', '').trim();
        const user = await this.usersService.findUserByEmail(payload.email);
        return {user, refreshToken}; 
    }
}

