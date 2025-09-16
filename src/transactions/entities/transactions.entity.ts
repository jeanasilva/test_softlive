import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { NumericColumnTransformer } from '../../common/transformers/numeric-column.transformer';
import { Wallet } from '../../wallets/entity/wallets.entity';

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wallet, wallet => wallet.sentTransactions, { onDelete: 'CASCADE' })
  fromWallet: Wallet;

  @Column()
  fromWalletId: number;

  @ManyToOne(() => Wallet, wallet => wallet.receivedTransactions, { onDelete: 'CASCADE' })
  toWallet: Wallet;

  @Column()
  toWalletId: number;

  @Column('decimal', { precision: 10, scale: 2, transformer: new NumericColumnTransformer() })
  amount: number;

  @Column({ type: 'simple-enum', enum: TransactionStatus, default: TransactionStatus.SUCCESS })
  status: TransactionStatus;

  @Column({ nullable: true, unique: true })
  transactionId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
