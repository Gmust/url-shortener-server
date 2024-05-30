import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { hash } from 'bcrypt';

import { User, UserSchema } from '../schemas/user.schema';
import { UsersService } from './users.service';

@Module({
  imports: [MongooseModule.forFeatureAsync([
    {
      name: User.name,
      useFactory: () => {
        const schema = UserSchema;
        schema.pre('save', async function(next) {
          if (!this.isModified('password')) {
            return next();
          }
          try {
            const hashedPassword = await hash(this.password, 12);
            this.password = hashedPassword;
            return next();
          } catch (e) {
            return next(e);
          }
        });
        return schema;
      },
    },
  ])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {
}
