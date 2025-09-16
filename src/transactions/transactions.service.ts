import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from '../wallets/entity/wallets.entity';
import { WalletSummaryDto } from '../wallets/dto/wallet-response.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { Transaction, TransactionStatus } from './entities/transactions.entity';
import { PaginationQueryDto, toSkipTake } from '../common/dto/pagination-query.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    if (createTransactionDto.fromWalletId === createTransactionDto.toWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    if (createTransactionDto.transactionId) {
      const transactionAlreadyExists = await this.transactionsRepository.exists({
        where: { transactionId: createTransactionDto.transactionId },
      });

      if (transactionAlreadyExists) {
        throw new BadRequestException('transactionId already used');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromWallet = await queryRunner.manager.findOne(Wallet, { where: { id: createTransactionDto.fromWalletId } });
      if (!fromWallet) {
        throw new NotFoundException('Source wallet not found');
      }

      const toWallet = await queryRunner.manager.findOne(Wallet, { where: { id: createTransactionDto.toWalletId } });
      if (!toWallet) {
        throw new NotFoundException('Destination wallet not found');
      }

      if (fromWallet.balance < createTransactionDto.amount) {
        throw new BadRequestException('Insufficient funds');
      }

      fromWallet.balance -= createTransactionDto.amount;
      toWallet.balance += createTransactionDto.amount;

      await queryRunner.manager.save([fromWallet, toWallet]);

      const transaction = queryRunner.manager.create(Transaction, {
        ...createTransactionDto,
        status: TransactionStatus.SUCCESS,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      const completeTransaction = await this.transactionsRepository.findOne({
        where: { id: savedTransaction.id },
        relations: { fromWallet: true, toWallet: true },
      });

      if (!completeTransaction) {
        throw new InternalServerErrorException('Transaction was not persisted correctly');
      }

      return this.toResponseDto(completeTransaction);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await this.registerFailedTransaction(createTransactionDto);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Unable to process transaction');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query?: PaginationQueryDto): Promise<TransactionResponseDto[]> {
    const { skip, take } = toSkipTake(query ?? new PaginationQueryDto());
    const transactions = await this.transactionsRepository.find({
      relations: { fromWallet: true, toWallet: true },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return transactions.map(transaction => this.toResponseDto(transaction));
  }

  private async registerFailedTransaction(createTransactionDto: CreateTransactionDto): Promise<void> {
    try {
      const failedTransaction = this.transactionsRepository.create({
        ...createTransactionDto,
        status: TransactionStatus.FAILED,
      });

      await this.transactionsRepository.save(failedTransaction);
    } catch (error) {
      // ignore persistence issues for failed transactions to avoid masking original error
    }
  }

  private toResponseDto(transaction: Transaction & { fromWallet?: Wallet; toWallet?: Wallet }): TransactionResponseDto {
    return plainToInstance(TransactionResponseDto, {
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      fromWalletId: transaction.fromWalletId,
      toWalletId: transaction.toWalletId,
      fromWallet: transaction.fromWallet ? this.toWalletSummary(transaction.fromWallet) : undefined,
      toWallet: transaction.toWallet ? this.toWalletSummary(transaction.toWallet) : undefined,
      createdAt: transaction.createdAt,
      transactionId: transaction.transactionId,
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
