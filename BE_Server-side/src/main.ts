import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exeption.filter';
import { TransformResponseInterceptor } from './common/interceptor/transform-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Cho phép frontend ở port 3001 gọi
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Config
  const configService = app.get(ConfigService);

  // API Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('The first NestJs project')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('User, Garden, Vegatable, Sale')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({ transform: true })); // Ensures proper validation and transformation
  const port = configService.get<string>('PORT');
  await app.listen(port ?? 3000);
}
bootstrap();
