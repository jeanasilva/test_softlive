import { ApiProperty } from '@nestjs/swagger';

export class WalletSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 150.75 })
  balance: number;

  @ApiProperty({ example: 'BRL' })
  currency: string;
}

export class WalletResponseDto extends WalletSummaryDto {
  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;
}

export class WalletBalanceDto {
  @ApiProperty({ example: 1 })
  walletId: number;

  @ApiProperty({ example: 120.5 })
  balance: number;

  @ApiProperty({ example: 'BRL' })
  currency: string;
}
