import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ResultBatch } from './result-batch.entity';
import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';
import { JoinColumn } from 'typeorm';

@Entity('result_item')
export class ResultItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ResultBatch, (batch) => batch.items, { onDelete: 'CASCADE' })
  batch: ResultBatch;

  @Index()
  @Column({ type: 'integer' })
  batch_id: number;

  // OBX-3 code (e.g., GLU, WBC, HGB)
  @Index()
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  unit: string | null;

  // OBX-8 abnormal flags (N/H/L, etc.)
  @Column({ type: 'varchar', length: 16, nullable: true })
  flag: string | null;

  @ManyToOne(() => SousAnalyseRef, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'sous_analyse_id' })
sous_analyse?: SousAnalyseRef | null;


@Index()
@Column({ type: 'integer', nullable: true })
sous_analyse_id: number | null;
}