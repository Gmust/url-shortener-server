import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [RolesService],
  controllers: [RolesController],
})
export class RolesModule {
}
