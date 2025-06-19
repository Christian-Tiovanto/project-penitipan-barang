export interface Product {
  id: number;
  name: string;
  price: number;
  initial_qty: number;
  qty: number;
  description: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

// @Entity('products')
// export class Product implements IProduct {
//   @ApiProperty({ example: 1 })
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ApiProperty({ example: 'Product Name' })
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
//   price: number;

//   @ApiProperty({ example: 10 })
//   @Column({
//     type: 'decimal',
//     transformer: {
//       to: (value: number) => value,
//       from: (value: string) => parseFloat(value),
//     },
//   })
//   qty: number;

//   @ApiProperty({ example: 'Product description' })
//   @Column({ type: 'varchar' })
//   desc: string;

//   @ApiProperty({ example: 10 })
//   @Column({
//     type: 'decimal',
//     default: 0,
//     transformer: {
//       to: (value: number) => value,
//       from: (value: string) => parseFloat(value),
//     },
//   })
//   initial_qty: number;

//   @ApiProperty({ example: false })
//   @Column({ type: 'boolean', default: false })
//   is_deleted: boolean;

//   @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
//   @CreateDateColumn()
//   created_at: Date;

//   @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
//   @UpdateDateColumn()
//   updated_at: Date;

//   @OneToMany(() => TransactionIn, (transaction_in) => transaction_in.product)
//   transaction_in: TransactionIn[];

//   @OneToMany(
//     () => TransactionOut,
//     (transaction_out) => transaction_out.productId,
//   )
//   transaction_out: TransactionOut[];

//   @OneToMany(() => ProductUnit, (productUnit) => productUnit.product)
//   product_unit: ProductUnit[];
// }
