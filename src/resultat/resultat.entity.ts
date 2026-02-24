import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ResultatInterpretationEnum {
  NORMAL = 'NORMAL',
  FAIBLE = 'FAIBLE',
  ELEVE = 'ELEVE',
  CRITIQUE_BAS = 'CRITIQUE_BAS',
  CRITIQUE_HAUT = 'CRITIQUE_HAUT',
}

@Entity('resultat')
export class Resultat {
  @PrimaryGeneratedColumn()
  resultat_id: number;

  @Column({ type: 'integer' })
  execution_id: number;

  @Column({ type: 'integer' })
  analyse_id: number;

  @Column({ type: 'varchar', length: 32, nullable: true })
  interpretation: ResultatInterpretationEnum | null;

  @Column({ type: 'boolean', default: false })
  est_pathologique: boolean;

  @Column({ type: 'text', nullable: true })
  commentaire: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  statut: ResultatInterpretationEnum | null;

  @Column({ type: 'integer', default: 1 })
  version: number;

  // ✅ Local Gateway ONLY (for 24h TTL cleanup)
  @Index()
  @Column({ type: 'datetime' })
  received_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'integer', nullable: true })
  validated_by: number | null;

  @Column({ type: 'datetime', nullable: true })
  validated_at: Date | null;
}