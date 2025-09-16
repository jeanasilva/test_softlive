import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Wallet } from '../wallets/entity/wallets.entity';
import { WalletSummaryDto } from '../wallets/dto/wallet-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const emailAlreadyUsed = await this.usersRepository.exists({ where: { email: createUserDto.email } });
    if (emailAlreadyUsed) {
      throw new BadRequestException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toResponseDto({ ...savedUser, wallets: [] });
  }

  async findAll(pagination?: { page?: number; limit?: number }): Promise<UserResponseDto[]> {
    const page = pagination?.page && pagination.page > 0 ? pagination.page : 1;
    const limit = pagination?.limit && pagination.limit > 0 ? Math.min(pagination.limit, 100) : 10;
    const users = await this.usersRepository.find({
      relations: { wallets: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });
    return users.map(user => this.toResponseDto(user));
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: { wallets: true } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  async ensureExists(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private toResponseDto(user: User & { wallets?: Wallet[] }): UserResponseDto {
    const wallets = (user.wallets ?? []).map(wallet => this.toWalletSummary(wallet));

    return plainToInstance(UserResponseDto, {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      wallets,
    });
  }

  private toWalletSummary(wallet: Wallet): WalletSummaryDto {
    return plainToInstance(WalletSummaryDto, {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      currency: wallet.currency,
    });
  }
}

