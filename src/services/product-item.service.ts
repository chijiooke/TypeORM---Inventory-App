import { Injectable } from '@matchmakerjs/di';
import { ErrorResponse, HandlerContext } from '@matchmakerjs/matchmaker';
import { IncomingMessage, ServerResponse } from 'http';
import { EntityManager } from 'typeorm';
import { PageRequest } from '../data/dto/request/page.request';
import {
    ProductItemApiRequest,
    UpdateProductItemApiRequest,
    UpdateProductItemCountApiRequest,
} from '../data/dto/request/product-item.request';
import { SearchResult } from '../data/dto/responses/search-result';
import { TransactionTypeEnum } from '../data/dto/enums/transactionType.enum';
import { ProductItem } from '../data/entities/product-item.entity';
import { StringUtils } from '../utils/string-utils';

@Injectable()
export class ProductItemService {
    constructor(private entityManager: EntityManager) {}

    async saveProductItem(
        request: ProductItemApiRequest,
        context: HandlerContext<IncomingMessage, ServerResponse>,
    ): Promise<ProductItem> {
        const productItem = new ProductItem();

        productItem.name = StringUtils.normalizeSpace(request.name);

        const product = await this.entityManager
            .createQueryBuilder(ProductItem, 'e')
            .where('lower(e.name)=lower(:name)', { name: StringUtils.normalizeSpace(request.name) })
            .getOne();

        // const product = await this.entityManager.findOneBy(ProductItem, { name: request.name });
        // const isSimilarName =
        //     product.name.replace(' ', '').toLowerCase() === request.name.replace(' ', '').toLowerCase();

        if (product !== null) {
            throw new ErrorResponse(400, {
                message: `Product with name '${product.name}' already exists`,
            });
        }

        context.response.statusCode = 201;

        return await this.entityManager.save(productItem);
    }

    async getProducts(request: PageRequest): Promise<SearchResult<ProductItem>> {
        const offset = request?.offset || 0;
        const limit = request?.limit || 10;

        const [products, total] = await this.entityManager.findAndCount(ProductItem, {
            skip: offset,
            take: limit,
        });

        // count all individual items in store
        const totalItemCount = products
            .map((product) => Number(product.count))
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        return {
            results: products,
            limit,
            offset,
            totalProducts: total,
            totalItemCount,
        };
    }

    async getProduct(id: number, context: HandlerContext<IncomingMessage, ServerResponse>): Promise<ProductItem> {
        const product = await this.entityManager.findOneBy(ProductItem, { id });

        if (product === null) {
            throw new ErrorResponse(404, {
                message: 'Product not found',
            });
        }

        context.response.statusCode = 200;
        return product;
    }

    async updateProductItem(
        request: UpdateProductItemApiRequest,
        context: HandlerContext<IncomingMessage, ServerResponse>,
    ) {
        const product = await this.entityManager.findOneBy(ProductItem, { id: request.id });
        const productWithSameName = await this.entityManager.findOneBy(ProductItem, { name: request.name });

        if (product === null) {
            throw new ErrorResponse(404, {
                message: `Product with ID '${request.id}' does not exist`,
            });
        }

        if (productWithSameName !== null && productWithSameName.id !== request.id) {
            throw new ErrorResponse(400, {
                message: `Product with name '${request.name}' already exists`,
            });
        }

        await this.entityManager.update(ProductItem, request.id, {
            name: request.name,
            count: request.count,
        });

        context.response.statusCode = 201;
        context.response.statusMessage = `Product with ID '${request.id}' succesfully updated`;

        return { message: `Product with ID '${request.id}' succesfully updated` };
    }

    async updateProductItemCount(
        request: UpdateProductItemCountApiRequest,
        context: HandlerContext<IncomingMessage, ServerResponse>,
    ) {
        const product = await this.entityManager.findOneBy(ProductItem, { id: request.id });

        if (product === null) {
            throw new ErrorResponse(404, {
                message: `Product with ID '${request.id}' does not exist`,
            });
        }

        // validate transaction type
        const isTransactionTypeValid = Object.values(TransactionTypeEnum).includes(request.transactionType);
        if (!isTransactionTypeValid) {
            throw new ErrorResponse(400, {
                message: `invalid transaction type`,
            });
        }

        // update count
        let currentCount;
        if (request.transactionType === TransactionTypeEnum.ADDED) {
            currentCount = product.count + request.count;
        } else if (request.count > product.count) {
            throw new ErrorResponse(400, {
                message: `Can't remove the value  ${request.count} item(s) from ${product.count} item(s) `,
            });
        } else {
            currentCount = product.count - request.count;
        }

        await this.entityManager.update(ProductItem, request.id, {
            count: currentCount,
        });

        context.response.statusCode = 201;
        context.response.statusMessage = `Product with ID '${request.id}' succesfully updated`;

        return {
            message: `Product with ID '${request.id}' succesfully updated, ${request.count} item(s) ${request.transactionType}`,
        };
    }

    async deleteProduct(id: number, context: HandlerContext<IncomingMessage, ServerResponse>): Promise<ProductItem> {
        const product = await this.entityManager.findOneBy(ProductItem, { id });

        if (product === null) {
            throw new ErrorResponse(404, {
                message: 'Product not found',
            });
        }

        await this.entityManager.delete(ProductItem, { id });

        context.response.statusCode = 200;
        context.response.statusMessage = `Product with ID '${id}' deleted succefully`;
        return;
    }
}
