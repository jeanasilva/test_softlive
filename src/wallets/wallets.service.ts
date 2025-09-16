import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Wallet } from './entity/wallets.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletBalanceDto, WalletResponseDto } from './dto/wallet-response.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    private readonly usersService: UsersService,
  ) {}

  async create(createWalletDto: CreateWalletDto): Promise<WalletResponseDto> {
    await this.usersService.ensureExists(createWalletDto.userId);

    const wallet = this.walletsRepository.create({
      userId: createWalletDto.userId,
      currency: createWalletDto.currency,
      balance: 0,
    });

    const savedWallet = await this.walletsRepository.save(wallet);
    return this.toResponseDto(savedWallet);
  }

  async findOne(id: number): Promise<WalletResponseDto> {
    const wallet = await this.getWalletOrThrow(id);
    return this.toResponseDto(wallet);
  }

  async getBalance(id: number): Promise<WalletBalanceDto> {
    const wallet = await this.getWalletOrThrow(id);

    return plainToInstance(WalletBalanceDto, {
      walletId: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency,
    });
  }

  private async getWalletOrThrow(id: number): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({ where: { id } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  private toResponseDto(wallet: Wallet): WalletResponseDto {
    return plainToInstance(WalletResponseDto, {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.createdAt,
    });
  }
}
