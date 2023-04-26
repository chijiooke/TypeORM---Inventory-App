import { IsDefined, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { TransactionTypeEnum } from '../enums/transactionType.enum';

export class ProductItemApiRequest {
    @IsDefined()
    @IsNotEmpty()
    name: string;
}

export class UpdateProductItemApiRequest {
    @IsDefined()
    @IsNotEmpty()
    id: number;

    @IsDefined()
    @IsNotEmpty()
    name: string;

    @IsDefined()
    @IsNotEmpty()
    @Min(0)
    @IsNumber()
    count: number;
}

export class UpdateProductItemCountApiRequest {
    @IsDefined()
    @IsNotEmpty()
    id: number;

    @IsDefined()
    @IsNotEmpty()
    transactionType: TransactionTypeEnum;

    @IsDefined()
    @IsNotEmpty()
    @Min(0)
    @IsNumber()
    count: number;
}
