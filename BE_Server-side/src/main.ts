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
<<<<<<< HEAD
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3002'],
=======
  app.enableCors({
    origin: 'http://localhost:3001',
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Response Interceptor
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  //Validate global
  app.useGlobalPipes(
    new ValidationPipe({
<<<<<<< HEAD
      whitelist: true,
=======
>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: async (errors: ValidationError[]) => {
        const errorMessages = extractErrorMessages(errors);
        return new BadRequestException(errorMessages.toString());
      },
    }),
  );

  // Config
  const configService = app.get(ConfigService);

<<<<<<< HEAD
  // API Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('The first NestJs project')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('User, Garden, Vegatable, Sale')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
=======
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

>>>>>>> c793afaac12fe24bcdd1f01a4e395724005c3abb
  const port = configService.get<string>('PORT');
  await app.listen(port ?? 3000);
}
bootstrap();
