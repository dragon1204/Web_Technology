import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";



@ApiTags('Authentication Secion')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {} 
    
    @ApiOperation({summary:"Used to Register"})
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }

    @ApiOperation({summary:"Used to Login"})
    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(@Body() data: LoginDto) {
        return this.authService.login(data);
    }

    // @Post("logout")
    //  @HttpCode(HttpStatus.OK)
    // logoutLocal(){
    //     return this.authService.logout();
    // }

    @ApiOperation({summary:"Used to refresh the JWT"})
    @Post("refresh")
    refreshTokens(@Body("refresh_token") refreshToken : string){
        return this.authService.refreshTokens(refreshToken);
    }

}

