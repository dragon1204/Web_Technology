import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<string>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    this.logger.log('Initializing EmailService...');
    this.logger.log(`SMTP_HOST: ${smtpHost || 'not set (using default: smtp.gmail.com)'}`);
    this.logger.log(`SMTP_PORT: ${smtpPort || 'not set (using default: 587)'}`);
    this.logger.log(`SMTP_USER: ${smtpUser ? smtpUser.substring(0, 3) + '***' : 'not set'}`);
    this.logger.log(`SMTP_PASSWORD: ${smtpPassword ? '***' : 'not set'}`);

    this.transporter = nodemailer.createTransport({
      host: smtpHost || 'smtp.gmail.com',
      port: parseInt(smtpPort || '587'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Tối ưu performance - giảm thời gian chờ
      connectionTimeout: 10000, // 10 giây timeout cho connection
      greetingTimeout: 5000, // 5 giây timeout cho greeting
      socketTimeout: 10000, // 10 giây timeout cho socket
      // Connection pooling - tái sử dụng connection
      pool: true,
      maxConnections: 5, // Tối đa 5 connections đồng thời
      maxMessages: 100, // Tối đa 100 messages mỗi connection
      rateDelta: 1000, // 1 giây giữa các messages
      rateLimit: 5, // Tối đa 5 messages/giây
      // DNS optimization
      dnsTimeout: 5000, // 5 giây timeout cho DNS lookup
      // Tắt debug để tăng performance
      debug: false,
      logger: false,
    });
  }

  async onModuleInit() {
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    if (!smtpUser || !smtpPassword) {
      this.logger.warn('⚠️  Email service not configured. SMTP_USER or SMTP_PASSWORD is missing.');
      this.logger.warn('⚠️  OTP will be logged to console instead of being sent via email.');
      return;
    }

    try {
      await this.verifyConnection();
    } catch (error) {
      this.logger.error('❌ Email service verification failed:', error.message);
      this.logger.error('⚠️  OTP will be logged to console instead of being sent via email.');
    }
  }

  /**
   * Send OTP email
   */
  async sendOtpEmail(to: string, code: string, type: 'REGISTER' | 'FORGOT_PASSWORD'): Promise<void> {
    const fromEmail = this.configService.get<string>('SMTP_FROM_EMAIL') || this.configService.get<string>('SMTP_USER');
    const appName = this.configService.get<string>('APP_NAME') || 'Garden IoT';

    const subject = type === 'REGISTER' 
      ? `Mã OTP đăng ký tài khoản - ${appName}`
      : `Mã OTP đặt lại mật khẩu - ${appName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #4cbe00;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .otp-code {
              background-color: #f0f0f0;
              border: 2px dashed #4cbe00;
              padding: 20px;
              text-align: center;
              font-size: 32px;
              font-weight: bold;
              color: #4cbe00;
              letter-spacing: 8px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${appName}</h1>
            </div>
            <div class="content">
              <h2>${type === 'REGISTER' ? 'Mã OTP đăng ký tài khoản' : 'Mã OTP đặt lại mật khẩu'}</h2>
              <p>Xin chào,</p>
              <p>Bạn đã yêu cầu ${type === 'REGISTER' ? 'đăng ký tài khoản' : 'đặt lại mật khẩu'} với email: <strong>${to}</strong></p>
              
              <p>Vui lòng sử dụng mã OTP sau đây:</p>
              
              <div class="otp-code">${code}</div>
              
              <div class="warning">
                <strong>⚠️ Lưu ý:</strong>
                <ul>
                  <li>Mã OTP này có hiệu lực trong <strong>10 phút</strong></li>
                  <li>Không chia sẻ mã này với bất kỳ ai</li>
                  <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này</li>
                </ul>
              </div>
              
              <p>Trân trọng,<br>Đội ngũ ${appName}</p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
${appName}
${type === 'REGISTER' ? 'Mã OTP đăng ký tài khoản' : 'Mã OTP đặt lại mật khẩu'}

Xin chào,
Bạn đã yêu cầu ${type === 'REGISTER' ? 'đăng ký tài khoản' : 'đặt lại mật khẩu'} với email: ${to}

Mã OTP của bạn là: ${code}

Lưu ý:
- Mã OTP này có hiệu lực trong 10 phút
- Không chia sẻ mã này với bất kỳ ai
- Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này

Trân trọng,
Đội ngũ ${appName}
    `;

    try {
      await this.transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error);
      this.logger.error(`Error details: ${JSON.stringify({
        code: error.code,
        command: error.command,
        response: error.response,
        message: error.message
      })}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email service is configured correctly');
      return true;
    } catch (error) {
      this.logger.error('❌ Email service configuration error:', error);
      if (error.code === 'EAUTH') {
        this.logger.error('❌ Authentication failed. Please check SMTP_USER and SMTP_PASSWORD.');
      } else if (error.code === 'ECONNECTION') {
        this.logger.error('❌ Connection failed. Please check SMTP_HOST and SMTP_PORT.');
      } else {
        this.logger.error(`❌ Error code: ${error.code}, Message: ${error.message}`);
      }
      return false;
    }
  }
}
