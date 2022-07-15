import { Column, DataType, Model, Table, HasOne, BelongsToMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BasketProducts } from 'src/basket/basket-products.model';
import { Basket } from 'src/basket/basket.model';
import { Beers } from 'src/beers/beers.model';
import { Brand } from 'src/brands/brands.model';
import { Snack } from 'src/snacks/snacks.model';

@Table({ tableName: 'products' })
export class Products extends Model<Products> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.STRING, allowNull: false })
    description: string;

    @Column({ type: DataType.INTEGER })
    price: number;

    @Column({ type: DataType.INTEGER })
    quantity: number;

    @ForeignKey(() => Brand)
    brandId: Brand;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    inStock: boolean;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    isActive: boolean;

    @HasOne(() => Beers)
    beer: Beers;

    @HasOne(() => Snack)
    snack: Snack;

    @BelongsTo(() => Brand)
    brand: Brand;

    @BelongsToMany(() => Basket, () => BasketProducts)
    baskets: Basket[];
}