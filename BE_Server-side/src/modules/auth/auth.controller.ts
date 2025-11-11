import { 
  Body, 
  Controller, 
  Get,
  HttpCode, 
  HttpStatus, 
  Post, 
  Req, 
  UseGuards 
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard } from "@nestjs/passport";

@ApiTags('Authentication Section')
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

    @ApiOperation({summary:"Used to refresh the JWT"})
    @Post("refresh")
    refreshTokens(@Body("refresh_token") refreshToken : string){
        return this.authService.refreshTokens(refreshToken);
    }

    // ================= GOOGLE LOGIN =================

    @ApiOperation({ summary: "Login with Google (redirect to Google page)" })
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        
    }

    @ApiOperation({ summary: "Google redirect URL (Google returns here)" })
    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        return req.user; 
    }
}
