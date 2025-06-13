import { RmqOptions, Transport } from '@nestjs/microservices';

export function getRmqConfig(queue: string): RmqOptions {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://localhost:5672'],
      queue,
      queueOptions: {
        durable: false,
      },
    },
  };
}
