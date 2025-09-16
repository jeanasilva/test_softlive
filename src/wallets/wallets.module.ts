import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Wallet } from './entity/wallets.entity';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), UsersModule],
  providers: [WalletsService],
  controllers: [WalletsController],
})
export class WalletsModule {}
