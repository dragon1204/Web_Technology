import { Injectable, BadRequestException, Optional, Inject } from '@nestjs/common';
import { EmailService } from '../email/email.service';

interface OtpData {
  code: string;
  email: string;
  type: 'REGISTER' | 'FORGOT_PASSWORD';
  expiresAt: Date;
  verified: boolean;
}

@Injectable()
export class OtpService {
  // In-memory storage for OTPs (in production, use Redis or database)
  private otpStore: Map<string, OtpData> = new Map();

  constructor(
    @Optional() @Inject(EmailService) private emailService?: EmailService,
  ) {}

  /**
   * Generate a 6-digit OTP code
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate OTP key from email and type
   */
  private getOtpKey(email: string, type: string): string {
    return `${email}:${type}`;
  }

  /**
   * Send OTP code (for now, just log it - in production, send via email)
   */
  async sendOtp(email: string, type: 'REGISTER' | 'FORGOT_PASSWORD'): Promise<string> {
    const code = this.generateOtpCode();
    const key = this.getOtpKey(email, type);
    
    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const otpData: OtpData = {
      code,
      email,
      type,
      expiresAt,
      verified: false,
    };

    this.otpStore.set(key, otpData);

    if (this.emailService) {
      try {
        await this.emailService.sendOtpEmail(email, code, type);
        console.log(`✅ OTP email sent to ${email}`);
      } catch (error) {
        console.error(`❌ Failed to send OTP email to ${email}:`, error);
        console.error(`Error details:`, {
          code: error.code,
          command: error.command,
          response: error.response,
          message: error.message
        });
        console.log(`\n📧 OTP Code for ${email} (${type}): ${code}\n`);
        console.log(`⏰ Expires at: ${expiresAt.toISOString()}\n`);
      }
    } else {
      console.log(`\n📧 OTP Code for ${email} (${type}): ${code}\n`);
      console.log(`⏰ Expires at: ${expiresAt.toISOString()}\n`);
      console.log(`⚠️  Email service not configured. OTP is only logged to console.\n`);
    }

    return code;
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(email: string, code: string, type: 'REGISTER' | 'FORGOT_PASSWORD'): Promise<boolean> {
    const key = this.getOtpKey(email, type);
    const otpData = this.otpStore.get(key);

    if (!otpData) {
      throw new BadRequestException('OTP not found or expired. Please request a new OTP.');
    }

    if (otpData.verified) {
      throw new BadRequestException('OTP has already been used.');
    }

    if (new Date() > otpData.expiresAt) {
      this.otpStore.delete(key);
      throw new BadRequestException('OTP has expired. Please request a new OTP.');
    }

    if (otpData.code !== code) {
      throw new BadRequestException('Invalid OTP code.');
    }

    // Mark as verified
    otpData.verified = true;
    this.otpStore.set(key, otpData);

    return true;
  }

  /**
   * Check if OTP is verified (for password reset/register)
   */
  isOtpVerified(email: string, type: 'REGISTER' | 'FORGOT_PASSWORD'): boolean {
    const key = this.getOtpKey(email, type);
    const otpData = this.otpStore.get(key);
    return otpData?.verified === true;
  }

  /**
   * Remove OTP after use
   */
  removeOtp(email: string, type: 'REGISTER' | 'FORGOT_PASSWORD'): void {
    const key = this.getOtpKey(email, type);
    this.otpStore.delete(key);
  }

  /**
   * Clean up expired OTPs (call periodically)
   */
  cleanupExpiredOtps(): void {
    const now = new Date();
    for (const [key, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(key);
      }
    }
  }
}
