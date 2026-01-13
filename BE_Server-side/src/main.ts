import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exeption.filter';
import { TransformResponseInterceptor } from './common/interceptor/transform-response.interceptor';
import { ValidationError } from 'class-validator';
import { extractErrorMessages } from './common/helper/extractErrorMessages';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Config
  const configService = app.get(ConfigService);
  
  // CORS Configuration
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOrigin 
    ? corsOrigin.split(',').map(origin => origin.trim())
      : [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://159.223.61.25:3000', 
        'http://159.223.61.25:3001',
        'https://localhost:3000',
        'https://localhost:3001',
        'https://159.223.61.25:3000',
        'https://159.223.61.25:3001',
        'https://gardeniothust.duckdns.org',
        'https://*.web.app',
        'https://*.firebaseapp.com'
      ];
  
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed === '*') return true;
        if (allowed.includes('*')) {
          const pattern = allowed.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          return regex.test(origin);
        }
        return allowed === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  //Validate global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: async (errors: ValidationError[]) => {
        const errorMessages = extractErrorMessages(errors);
        return new BadRequestException(errorMessages.toString());
      },
    }),
  );

  // Swagger setup
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API')
      .setDescription('Api documents')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .build(),
  );
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  // End Swagger setup

  const port = configService.get<string>('PORT');
  await app.listen(port ?? 3000);
}
bootstrap();
