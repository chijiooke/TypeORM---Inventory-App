import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProductItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: false, default: 0 })
    count: number;
}
