import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SousAnalyseRef } from '../refs/sous-analyse-ref.entity';

@Entity('sous_analyse_map')
@Index(['instrument_code', 'external_code', 'external_system'], { unique: true })
export class SousAnalyseMap {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  instrument_code: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  external_code: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  external_system: string | null;

  @Column()
  sous_analyse_ref_id: number;

  @ManyToOne(() => SousAnalyseRef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sous_analyse_ref_id' })
  sous_analyse_ref: SousAnalyseRef;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}