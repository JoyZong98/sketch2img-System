import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Work extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  inputFilePath: string;

  @Column({
    nullable: true,
  })
  outputFilePath: string;

  @Column({
    default: false,
  })
  isPublished: boolean

  @ManyToOne(() => User, user => user.works)
  user: User;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

}
