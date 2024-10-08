import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User as UserEntity } from '@/domain/user/user.entity';
import { User, UserDocument } from '@/infrastructure/schema/schema.user';
import { IUserRepository } from '@/infrastructure/repository/interfaces/user.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = new this.userModel({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      avatarHash: user.avatarHash,
      avatarBase64: user.avatarBase64,
      userId: user.userId,
    });
    const savedUser = await createdUser.save();
    return this.mapToEntity(savedUser);
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      const users = await this.userModel.find().exec();
      return users.map((user) => this.mapToEntity(user));
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.userModel.findById(id).exec();
      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    userUpdate: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, userUpdate, { new: true })
        .exec();
      return updatedUser ? this.mapToEntity(updatedUser) : null;
    } catch (error) {
      throw error;
    }
  }

  async updateAvatar(
    userId: string,
    hash: string,
    base64: string,
  ): Promise<UserEntity> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { avatarHash: hash, avatarBase64: base64 },
        { new: true },
      )
      .exec();

    if (!updatedUser) {
      throw new Error(`User with id ${userId} not found`);
    }

    return this.mapToEntity(updatedUser);
  }

  async findByUserId(userId: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ userId }).exec();
    return user ? this.mapToEntity(user) : null;
  }

  async updateAvatarHash(userId: string, hash: string): Promise<UserEntity> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { avatarHash: hash }, { new: true })
        .exec();

      if (!updatedUser) {
        throw new Error(`User with id ${userId} not found`);
      }

      return this.mapToEntity(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async findByExternalId(externalId: string): Promise<UserEntity | null> {
    const user = await this.userModel.findOne({ externalId }).exec();
    return user ? this.mapToEntity(user) : null;
  }

  private mapToEntity(document: UserDocument): UserEntity {
    return new UserEntity(
      document._id.toString(),
      document.firstName,
      document.lastName,
      document.email,
      document.avatar || null,
      document.avatarHash || null,
      document.avatarBase64 || null,
      document.userId || null,
    );
  }
  async removeAvatar(userId: string): Promise<UserEntity> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $unset: { avatarHash: '', avatarBase64: '' } },
          { new: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      return this.mapToEntity(updatedUser);
    } catch (error) {
      throw error;
    }
  }
}
