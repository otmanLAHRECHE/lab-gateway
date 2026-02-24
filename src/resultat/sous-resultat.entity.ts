import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Resultat, ResultatInterpretationEnum } from './resultat.entity';

@Entity('sous_resultat')
export class SousResultat {
  @PrimaryGeneratedColumn()
  sous_resultat_id: number;

  @ManyToOne(() => Resultat, { onDelete: 'CASCADE' })
  resultat_parent: Resultat;

  @Index()
  @Column({ type: 'integer' })
  resultat_parent_id: number;

  @Index()
  @Column({ type: 'integer' })
  sous_analyse_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  valeur: string | null;

  @Column({ type: 'real', nullable: true })
  valeur_numerique: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  interpretation: ResultatInterpretationEnum | null;

  @Column({ type: 'boolean', default: false })
  est_pathologique: boolean;

  @CreateDateColumn()
  created_at: Date;
}