import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletBalanceDto, WalletResponseDto } from './dto/wallet-response.dto';
import { WalletsService } from './wallets.service';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a wallet' })
  @ApiCreatedResponse({ description: 'Wallet created', type: WalletResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  create(@Body() createWalletDto: CreateWalletDto): Promise<WalletResponseDto> {
    return this.walletsService.create(createWalletDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by id' })
  @ApiOkResponse({ type: WalletResponseDto })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<WalletResponseDto> {
    return this.walletsService.findOne(id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiOkResponse({ type: WalletBalanceDto })
  @ApiNotFoundResponse({ description: 'Wallet not found' })
  getBalance(@Param('id', ParseIntPipe) id: number): Promise<WalletBalanceDto> {
    return this.walletsService.getBalance(id);
  }
}
