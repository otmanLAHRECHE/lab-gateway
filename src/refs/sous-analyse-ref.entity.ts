import { Column, Entity, Index, ManyToOne, PrimaryColumn } from 'typeorm';
import { AnalyseRef } from './analyse-ref.entity';

@Entity('sous_analyse_ref')
export class SousAnalyseRef {
  // reuse DME ID
  @PrimaryColumn({ type: 'integer' })
  sous_analyse_id: number;

  @ManyToOne(() => AnalyseRef, { onDelete: 'RESTRICT' })
  analyse: AnalyseRef;

  @Index()
  @Column({ type: 'integer' })
  analyse_id: number;

  // this is the key that will match your Mirth OBX-3 code (GLU, WBC...)
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  unit: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  data_type: string | null;
}