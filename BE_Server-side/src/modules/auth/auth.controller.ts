import { 
    BadRequestException,
    Body, 
    Controller, 
    Get,
    HttpCode, 
    HttpStatus, 
    Post, 
    Req, 
    Res,
    UseGuards 
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { VerifyTotpDto } from "./dto/totp.dto";
import { AtGuard } from "./guard/auth.guards";
import { QrDto } from "./dto/qr.dto";
import * as QRCode from "qrcode";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";

@ApiTags('Authentication Section')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) {} 
    
    @ApiOperation({summary:"Used to Register"})
    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() data: RegisterDto) {
        console.log("Role", data);
        return this.authService.register(data);
    }

    @ApiOperation({summary:"Used to Login"})
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60 } })
    @Post("login")
    async login(@Body() data: LoginDto, @Req() req) {
        return this.authService.login(data, req);
    }

    @ApiOperation({summary:"Used to refresh the JWT"})
    @Post("refresh")
    refreshTokens(@Body("refresh_token") refreshToken : string, @Req() req){
        return this.authService.refreshTokens(refreshToken, req);
    }

    @ApiOperation({ summary: "Logout current user" })
    @UseGuards(AtGuard)
    @Post("logout")
    async logout(@Req() req) {
        return this.authService.logout(req.user.id, req);
    }

    @ApiOperation({ summary: "Generate TOTP secret and URL for 2FA" })
    @UseGuards(AtGuard)
    @Post("2fa/generate")
    generateTwoFactor(@Req() req) {
        return this.authService.generateTwoFactorSecret(req.user.id);
    }

    @ApiOperation({ summary: "Enable 2FA using the provided TOTP code" })
    @UseGuards(AtGuard)
    @Post("2fa/enable")
    enableTwoFactor(@Req() req, @Body() dto: VerifyTotpDto) {
        return this.authService.enableTwoFactor(req.user.id, dto.code);
    }

    @ApiOperation({ summary: "Disable 2FA for the current user" })
    @UseGuards(AtGuard)
    @Post("2fa/disable")
    disableTwoFactor(@Req() req) {
        return this.authService.disableTwoFactor(req.user.id);
    }

    @ApiOperation({ summary: "Generate PNG QR for otpauth URL" })
    @UseGuards(AtGuard)
    @Post("2fa/qrcode")
    async generateQr(@Body() dto: QrDto, @Res() res: Response) {
        if (!dto.otpauthUrl) {
            throw new BadRequestException('otpauthUrl is required');
        }
        const png = await QRCode.toBuffer(dto.otpauthUrl, {
            type: 'png',
            errorCorrectionLevel: 'M',
            width: 256,
            margin: 1,
        });
        res.setHeader('Content-Type', 'image/png');
        res.send(png);
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
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        // Kiểm tra xem req.user có tồn tại không
        if (!req.user) {
            console.error("❌ req.user is undefined");
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
            return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
        }
        
        console.log("📥 Received user from Google OAuth:", JSON.stringify(req.user, null, 2));
        
        try {
            // Lưu thông tin user vào database và trả về tokens + user info
            const result = await this.authService.googleLogin(req.user);
            
            // Lấy frontend URL từ environment variable hoặc dùng default
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
            
            // Encode user data và tokens để truyền qua URL
            const userDataEncoded = encodeURIComponent(JSON.stringify(result.user));
            const tokenEncoded = encodeURIComponent(result.tokens.access_token);
            const refreshTokenEncoded = encodeURIComponent(result.tokens.refresh_token);
            
            // Redirect về frontend với tokens và user data trong query params
            const redirectUrl = `${frontendUrl}/auth/google/redirect?token=${tokenEncoded}&refresh_token=${refreshTokenEncoded}&user=${userDataEncoded}`;
            
            console.log("🔄 Redirecting to frontend:", redirectUrl);
            return res.redirect(redirectUrl);
        } catch (error) {
            console.error("❌ Error in googleAuthRedirect:", error);
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
            return res.redirect(`${frontendUrl}/login?error=oauth_error`);
        }
    }
}
