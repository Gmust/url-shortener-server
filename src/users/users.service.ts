import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { User, UserDocument } from '../schemas/user.schema';
import { FindUser } from '../types/User';
import { AddUrlToSavedDto } from './dto/add-url-to-saved.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RemoveLinkFromListDto } from './dto/remove-link-from-list.dto';

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
      return this.userModel.findOne({ email }).populate('subscription').populate('createdUrls');
    }
    if (_id) {
      return mongoose.Types.ObjectId.isValid(_id) && this.userModel.findById(_id).populate('subscription').populate('createdUrls');
    }
  }

  public async addUrlToSaved({ url, _id }: AddUrlToSavedDto): Promise<UserDocument> {
    const user = await this.userModel.findById(_id);
    if (!user) {
      throw new BadRequestException('Invalid user id');
    }

    if (!url || !url._id) {
      throw new BadRequestException('Invalid URL object');
    }

    user.createdUrls.push(url._id as mongoose.Types.ObjectId);
    await user.save();

    return user;
  }


  public async removeLinkFromUserList({ userId, linkId }: RemoveLinkFromListDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException('Invalid user id');
    }

    const updatedUrlsList = user.createdUrls.filter((urlId) => String(urlId) !== linkId);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { createdUrls: updatedUrlsList } },
      { new: true }
    );

    return updatedUser;
  }

}

