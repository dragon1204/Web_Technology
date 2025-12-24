import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientID || !clientSecret) {
      // Không có cấu hình Google OAuth -> log cảnh báo và dùng giá trị giả
      // để tránh crash toàn bộ ứng dụng. Tính năng đăng nhập Google
      // sẽ không hoạt động đúng nếu thiếu cấu hình thật.
      Logger.warn(
        'Google OAuth is not fully configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing). Using dummy values; Google login may not work correctly.',
        GoogleStrategy.name,
      );
    }

    super({
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-client-secret',
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
      passReqToCallback: false, // quan trọng
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    const user = {
      provider: profile.provider,
      providerId: profile.id,
      email: profile.emails?.[0].value,
      name: profile.displayName,
      avatar: profile.photos?.[0].value,
      accessToken,
    };

    done(null, user);
  }
}
