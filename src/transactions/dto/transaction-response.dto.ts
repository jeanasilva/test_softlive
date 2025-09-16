import { ApiProperty } from '@nestjs/swagger';
import { WalletSummaryDto } from '../../wallets/dto/wallet-response.dto';
import { TransactionStatus } from '../entities/transactions.entity';

export class TransactionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 75.5 })
  amount: number;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.SUCCESS })
  status: TransactionStatus;

  @ApiProperty({ example: 1 })
  fromWalletId: number;

  @ApiProperty({ example: 2 })
  toWalletId: number;

  @ApiProperty({ type: () => WalletSummaryDto, required: false })
  fromWallet?: WalletSummaryDto;

  @ApiProperty({ type: () => WalletSummaryDto, required: false })
  toWallet?: WalletSummaryDto;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'external-transaction-id', required: false })
  transactionId?: string;
}
