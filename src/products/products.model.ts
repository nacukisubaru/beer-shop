import { Column, DataType, Model, Table, HasOne, BelongsToMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BasketProducts } from 'src/basket/basket-products.model';
import { Basket } from 'src/basket/basket.model';
import { Beers } from 'src/beers/beers.model';
import { Brand } from 'src/brands/brands.model';
import { Fish } from 'src/fish/fish.model';
import { Snack } from 'src/snacks/snacks.model';
import { TypePackaging } from 'src/type-packaging/type-packaging.model';

@Table({ tableName: 'products' })
export class Products extends Model<Products> {
    
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    title: string;

    @Column({ type: DataType.STRING(800), allowNull: false })
    description: string;

    @Column({type: DataType.STRING})
    image:string;
    
    @Column({ type: DataType.INTEGER })
    price: number;

    @Column({ type: DataType.INTEGER })
    quantity: number;

    @ForeignKey(() => Brand)
    brandId: number;

    @Column({ type: DataType.STRING })
    brandName: string;

    @Column({ type: DataType.STRING })
    typePackagingName: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    inStock: boolean;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    isActive: boolean;

    @HasOne(() => Beers)
    beer: Beers;

    @HasOne(() => Snack)
    snack: Snack;

    @HasOne(() => Fish)
    fish: Fish;

    @ForeignKey(() => Beers)
    @Column({type: DataType.INTEGER})
    beerId: number;

    @ForeignKey(() => Snack)
    @Column({type: DataType.INTEGER})
    snackId: number;

    @ForeignKey(() => Fish)
    @Column({type: DataType.INTEGER})
    fishId: number;

    @BelongsTo(() => Brand)
    brand: Brand;

    @BelongsToMany(() => Basket, () => BasketProducts)
    baskets: Basket[];

    @BelongsTo(() => TypePackaging)
    typePackaging: TypePackaging;

    @ForeignKey(() => TypePackaging)
    @Column({type: DataType.INTEGER})
    typePackagingId: number;

    @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
    show: number;

    @Column({ type: DataType.BOOLEAN, allowNull: false })
    isPromote: boolean;
}