import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column
} from 'typeorm'
import { User } from './user'

@Entity()
export class AuthSessions {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User)
  user: User

  @Column()
  userAgent: string

  @Column()
  loginId: string

  @Column()
  lastAccessDate: Date
}
