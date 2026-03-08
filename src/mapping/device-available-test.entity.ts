import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('device_available_test')
@Index(['instrument_code', 'external_code'], { unique: true })
export class DeviceAvailableTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  instrument_code: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  external_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  external_name: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  external_system: string | null;

  @Column({ type: 'boolean', default: false })
  is_mapped: boolean;

  @Column({ type: 'integer', nullable: true })
  sous_analyse_ref_id: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}