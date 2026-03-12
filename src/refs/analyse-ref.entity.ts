import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('analyse_ref')
export class AnalyseRef {
  @PrimaryColumn({ type: 'integer' })
  analyse_id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  libelle: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domaine_analyse: string | null;
}