import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersEventsController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('get_user_by_email')
  async handleGetUserByEmail(@Payload() email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      return { exists: true };
    }
    return { exists: false };
  }

  @MessagePattern('user_created')
  async handleUserCreated(@Payload() data: any) {
    await this.usersService.create(data);
    return 'ok';
  }
}
