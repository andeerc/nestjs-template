import { NestFactory, Reflector } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ClassSerializerInterceptor, LogLevel, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DatabaseService } from './infrastructure/database/database.service';

async function bootstrap() {
  const logLevels: LogLevel[] =
    process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['verbose'];

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
    { logger: logLevels },
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.use(morgan('common'));
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Enterprise API')
    .setDescription('Enterprise NestJS API with clean architecture')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    customCss: `.swagger-ui .topbar { display: none }`,
    customSiteTitle: 'Enterprise API',
    jsonDocumentUrl: '/api/json',
    yamlDocumentUrl: '/api/yaml',
  });

  const databaseService = app.get(DatabaseService);
  await databaseService.runMigrations();
  await databaseService.runSeeds();

  const port = process.env.PORT || 3001;
  await app.listen({ host: '0.0.0.0', port: +port }, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`📊 Bull Dashboard: http://localhost:${port}/bull`);
  });
}

bootstrap();
