import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy, RtStrategy } from './strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { AtGuard } from './guard/auth.guards';



@Module({
    imports: [
        UsersModule, 
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '15m' // Token expiration time
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, RtStrategy, GoogleStrategy, AtGuard],
    exports: [AuthService, JwtModule]
})
export class AuthModule {}
