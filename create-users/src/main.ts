import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

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

  // 🚀 Configuramos el microservicio RabbitMQ (sin quitar nada de lo anterior)
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'user_created',
      queueOptions: {
        durable: false,
      },
    },
  });

  // 🚀 Iniciamos el microservicio RabbitMQ
  await app.startAllMicroservices();

  // 🚀 Iniciamos el servidor HTTP REST
  await app.listen(process.env.PORT || 3006);
}
bootstrap();
