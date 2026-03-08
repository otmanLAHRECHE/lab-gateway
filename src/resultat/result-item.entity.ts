import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ResultBatch } from './result-batch.entity';
import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';

@Entity('result_item')
@Index(['raw_code'])
export class ResultItem {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ FK column exists, so you can query: where: { batch_id: ... }
  @Column()
  batch_id: number;

  @ManyToOne(() => ResultBatch, (b) => b.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: ResultBatch;

  // ✅ raw fields (from device/HL7)
  @Column({ type: 'varchar', length: 64 })
  raw_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  raw_name?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  raw_system?: string | null;

  // ✅ link after mapping (nullable)
  @Column({ nullable: true })
sous_analyse_ref_id: number | null;

@ManyToOne(() => SousAnalyseRef, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'sous_analyse_ref_id' })
sous_analyse_ref?: SousAnalyseRef | null;

  // existing fields
  @Column({ type: 'varchar', length: 64, nullable: true })
  value?: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  unit?: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  flag?: string | null;
}