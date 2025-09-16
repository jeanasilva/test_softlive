import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NumericColumnTransformer } from '../../common/transformers/numeric-column.transformer';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transactions.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.wallets, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column('decimal', { precision: 10, scale: 2, transformer: new NumericColumnTransformer(), default: 0 })
  balance: number;

  @Column({ length: 3 })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Transaction, transaction => transaction.fromWallet)
  sentTransactions: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.toWallet)
  receivedTransactions: Transaction[];
}
