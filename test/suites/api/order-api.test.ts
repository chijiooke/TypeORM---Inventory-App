import { createContainer, LazyDIContainer } from '@matchmakerjs/di';
import { JwtClaims } from '@matchmakerjs/jwt-validator';
import { createTypeOrmModule, SqliteInMemoryConnectionOptions } from '@matchmakerjs/matchmaker-typeorm';
import * as dotenv from 'dotenv';
import { SearchResult } from '../../../src/data/dto/responses/search-result';
import { Order } from '../../../src/data/entities/order.entity';
// import { SearchResult } from '../../../src/app/data/dto/responses/search-result';
// import { Order } from '../../../src/app/data/entities/order.entity';
import { TestServer } from '../../conf/test-server';

describe('Order API', () => {
    let container: LazyDIContainer;
    let cleanUp: () => void;

    beforeAll(async () => {
        dotenv.config();
        const typeOrmModule = await createTypeOrmModule(SqliteInMemoryConnectionOptions());
        [container, cleanUp] = createContainer({
            modules: [typeOrmModule],
        });
    });

    afterAll(() => cleanUp && cleanUp());

    it('should reject invalid amount', async () => {
        const response = await TestServer(container, { sub: '1' } as JwtClaims).post(`/orders`, {
            customerId: '1',
            items: [
                {
                    productId: '1',
                    amount: 0,
                },
            ],
        });
        expect(response.statusCode).toBe(400);
    });

    it('should reject empty order items', async () => {
        const response = await TestServer(container, { sub: '1' } as JwtClaims).post(`/orders`, {
            customerId: '1',
            items: [],
        });
        expect(response.statusCode).toBe(400);
    });

    it('should reject missing order items', async () => {
        const response = await TestServer(container, { sub: '1' } as JwtClaims).post(`/orders`, {
            customerId: '1',
        });
        expect(response.statusCode).toBe(400);
    });

    it('should create order', async () => {
        const response = await TestServer(container, { sub: '1' } as JwtClaims).post(`/orders`, {
            customerId: '1',
            items: [
                {
                    productId: '1',
                    amount: 10,
                },
            ],
        });
        expect(response.statusCode).toBe(201);
    });

    it('should fetch order with items', async () => {
        const claims = { sub: '1' } as JwtClaims;
        await TestServer(container, claims).post(`/orders`, {
            customerId: '1',
            items: [
                {
                    productId: '1',
                    amount: 10,
                },
            ],
        });
        const response = await TestServer(container, claims).get('/orders');
        expect(response.statusCode).toBe(200);
        expect((response.parseJson() as SearchResult<Order>).results[0].items.length).toBe(1);
    });
});
