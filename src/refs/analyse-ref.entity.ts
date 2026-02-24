import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('analyse_ref')
export class AnalyseRef {
  // reuse DME ID
  @PrimaryColumn({ type: 'integer' })
  analyse_id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;
}