import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

const SUPPORTED_CURRENCIES = ['BRL', 'USD', 'EUR'];

export class CreateWalletDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ example: 'BRL', enum: SUPPORTED_CURRENCIES })
  @IsNotEmpty()
  @IsIn(SUPPORTED_CURRENCIES)
  currency: string;
}

export { SUPPORTED_CURRENCIES };
