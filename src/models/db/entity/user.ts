import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'
import { AuthSessions } from './authSessions'

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({default:null})
  resetPasswordToken?: string

  @Column({ nullable: true, default: null })
  email: string

  @Column({ nullable: true, default: null })
  salt: string

  @Column({ nullable: true, default: null })
  password: string

  @Column({ nullable: true, default: null })
  name: string

  @OneToMany(() => AuthSessions, authSession => authSession.user)
  sessions: AuthSessions[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
