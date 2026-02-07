import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }
  async create(userData: CreateUserDto) {
    const user = await this.userModel.findOne({ email: userData.email });
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userDataWithHashedPassword = { ...userData, password: hashedPassword };
    const userSaved = await this.userModel.create(userDataWithHashedPassword);
    return userSaved;
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(email: string) {
    return this.userModel.findOne({ email: email });
  }
  findByID(id: string) {
    return this.userModel.findOne({ _id: id });
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto);
  }

  remove(id: number) {
    return this.userModel.findByIdAndDelete(id);
  }
}
