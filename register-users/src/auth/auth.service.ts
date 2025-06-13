import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import {
  ClientProxy,
  ClientProxyFactory,
} from '@nestjs/microservices';
import { getRmqConfig } from '../../../libs/rabbitmq/rmq.config';
import * as bcryptjs from 'bcryptjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private client: ClientProxy;

  async onModuleInit() {
    this.client = ClientProxyFactory.create(getRmqConfig('user_created'));

    await this.client.connect();
  }

  private async userExists(email: string): Promise<boolean> {
    try {
      const userCheck = await firstValueFrom(
        this.client.send('get_user_by_email', email),
      );
      return userCheck.exists;
    } catch (error) {
      throw new InternalServerErrorException('Failed to verify user existence');
    }
  }

  private async emitUserCreatedEvent(payload: {
    name: string;
    email: string;
    password: string;
  }) {
    try {
      const result = await firstValueFrom(
        this.client.send('user_created', payload),
      );
      if (result !== 'ok') {
        throw new InternalServerErrorException('Failed to create user');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    if (await this.userExists(email)) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await this.emitUserCreatedEvent({ name, email, password: hashedPassword });

    return {
      message: 'User created successfully',
      user: {
        name,
        email,
      },
    };
  }
}
