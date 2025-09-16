import { ApiProperty } from '@nestjs/swagger';
import { WalletSummaryDto } from '../../wallets/dto/wallet-response.dto';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Alice Doe' })
  name: string;

  @ApiProperty({ example: 'alice@example.com' })
  email: string;

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: () => [WalletSummaryDto], required: false })
  wallets?: WalletSummaryDto[];
}
