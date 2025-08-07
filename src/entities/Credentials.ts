import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,

} from 'typeorm';


@Entity('credentials')
export class Credentials {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'json', name: 'auth_data' })
  authData: any;

  @Column({ type: 'uuid', name: 'author_id' })
  userId: any;

  @Column({ type: 'varchar', length: 36 })
  type: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP(3)' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP(3)' })
  updated_at: Date;



}