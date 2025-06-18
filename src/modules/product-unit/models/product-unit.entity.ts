import { Product } from '@app/modules/product/models/product.entity';

export interface ProductUnit {
  id: number;
  product: Product;
  productId: number;
  name: string;
  conversion_to_kg: number;
  created_at: Date;
  updated_at: Date;
}

// @Entity('product_units')
// export class ProductUnit implements IProductUnit {
//   @ApiProperty({ example: 1 })
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => Product, (product) => product.product_unit)
//   product: Product;

//   @ApiProperty({ example: 1 })
//   @Column()
//   productId: number;

//   @ApiProperty({ example: 'Product-unit Name' })
//   @Column({ type: 'varchar' })
//   name: string;

//   @ApiProperty({ example: 1000 })
//   @Column({
//     type: 'decimal',
//     transformer: {
//       to: (value: number) => value,
//       from: (value: string) => parseFloat(value),
//     },
//   })
//   conversion_to_kg: number;

//   @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
//   @CreateDateColumn()
//   created_at: Date;

//   @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
//   @UpdateDateColumn()
//   updated_at: Date;
// }
