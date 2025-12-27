import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { Technology, TechnologyDocument } from './technologies.schema';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { Content, ContentDocument } from '../content/content.schema';

@Injectable()
export class TechnologyService {
  constructor(
    @InjectModel(Technology.name)
    private readonly technologyModel: Model<TechnologyDocument>,
  ) {}

  async create(dto: CreateTechnologyDto, userId: string): Promise<Technology> {
    const existingTechnology = await this.technologyModel.findOne({
      name: dto.name,
    });
    if (existingTechnology) {
      throw new ConflictException('Technology already exists');
    }

    return await this.technologyModel.create({
      ...dto,
      createdBy: new Types.ObjectId(userId),
    });
  }

  async findAllPublic(): Promise<Technology[]> {
    return this.technologyModel.find().sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<Technology[]> {
    return this.technologyModel.find({
      createdBy: new Types.ObjectId(userId),
    });
  }

  async update(id: string, dto: UpdateTechnologyDto): Promise<Technology> {
    const updated = await this.technologyModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException('Technology not found');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.technologyModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Technology not found');
    }
  }
}
