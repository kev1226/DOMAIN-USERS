import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { getRmqConfig } from '../../libs/rabbitmq/rmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure RabbitMQ microservice using centralized config
  app.connectMicroservice(getRmqConfig('user_created'));

  // 🚀 Iniciamos el microservicio RabbitMQ
  await app.startAllMicroservices();

  // 🚀 Iniciamos el servidor HTTP REST
  await app.listen(process.env.PORT || 3006);
}
bootstrap();
