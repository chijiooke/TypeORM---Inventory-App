import {
    Delete,
    Get,
    HandlerContext,
    Patch,
    PathParameter,
    Post,
    Put,
    Query,
    RequestBody,
    RestController,
    Valid,
} from '@matchmakerjs/matchmaker';
import { AnonymousUserAllowed } from '@matchmakerjs/matchmaker-security';
import { IncomingMessage, ServerResponse } from 'http';
import { EntityManager } from 'typeorm';
import { PageRequest } from '../../data/dto/request/page.request';
import {
    ProductItemApiRequest,
    UpdateProductItemApiRequest,
    UpdateProductItemCountApiRequest,
} from '../../data/dto/request/product-item.request';
import { SearchResult } from '../../data/dto/responses/search-result';
import { ProductItem } from '../../data/entities/product-item.entity';
import { ProductItemService } from '../../services/product-item.service';

@AnonymousUserAllowed()
@RestController()
export class ProductItemController {
    constructor(private entityManager: EntityManager, private productService: ProductItemService) {}

    @Post('product')
    async saveProduct(
        context: HandlerContext<IncomingMessage, ServerResponse>,
        @RequestBody() @Valid() request: ProductItemApiRequest,
    ): Promise<ProductItem> {
        return this.productService.saveProductItem(request, context);
    }

    @Get('products')
    async getProducts(@Query() @Valid() request: PageRequest): Promise<SearchResult<ProductItem>> {
        return this.productService.getProducts(request);
    }

    @Get('product/:id:\\d+')
    async getProduct(
        context: HandlerContext<IncomingMessage, ServerResponse>,
        @PathParameter('id') id: number,
    ): Promise<ProductItem> {
        return this.productService.getProduct(id, context);
    }

    @Put('product')
    async updateProduct(
        context: HandlerContext<IncomingMessage, ServerResponse>,
        @RequestBody() @Valid() request: UpdateProductItemApiRequest,
    ) {
        return this.productService.updateProductItem(request, context);
    }

    @Patch('product-count')
    async updateProductItemCount(
        context: HandlerContext<IncomingMessage, ServerResponse>,
        @RequestBody() @Valid() request: UpdateProductItemCountApiRequest,
    ) {
        return this.productService.updateProductItemCount(request, context);
    }

    @Delete('product/:id:\\d+')
    async deleteProduct(
        context: HandlerContext<IncomingMessage, ServerResponse>,
        @PathParameter('id') id: number,
    ): Promise<ProductItem> {
        return this.productService.deleteProduct(id, context);
    }
}
