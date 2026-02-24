import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ResultItem } from './result-item.entity';

@Entity('result_batch')
export class ResultBatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  barcode: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  instrument_code: string | null;

  @Index()
  @Column({ type: 'datetime' })
  received_at: Date;

  @Column({ type: 'text', nullable: true })
  raw_hl7: string | null;

  @OneToMany(() => ResultItem, (item) => item.batch, { cascade: true })
  items: ResultItem[];

  @CreateDateColumn()
  created_at: Date;
}