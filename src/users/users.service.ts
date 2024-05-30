import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema';
import { FindUser } from '../types/User';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<User>) {
  }

  public async createUser({ name, surname, password, email }: CreateUserDto): Promise<UserDocument> {
    const dbUser = await this.findUser({ email });
    if (dbUser) {
      throw new BadRequestException('User with this email already exists!');
    }

    const newUser = await this.userModel.create({
      email,
      name,
      surname,
      password,
    });

    if (!newUser) {
      throw new InternalServerErrorException('Something went wrong');
    }

    return newUser;
  }


  public async findUser({ email, _id }: FindUser) {
    if (email) {
      return this.userModel.findOne({ email }).populate('subscription url');
    }
    if (_id) {
      return mongoose.Types.ObjectId.isValid(_id) && this.userModel.findById(_id).populate('subscription url');
    }
  }


}
