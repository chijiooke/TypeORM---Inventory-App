import { createContainer, DIContainerModule } from '@matchmakerjs/di';
import { JwtClaims } from '@matchmakerjs/jwt-validator';
import { addGracefulShutdown, startServer } from '@matchmakerjs/matchmaker';
import { SecureRequestListener } from '@matchmakerjs/matchmaker-security';
import {
    createTypeOrmModule,
    SqliteInMemoryConnectionOptions,
    TransactionalProxyFactory,
} from '@matchmakerjs/matchmaker-typeorm';
import { instanceToPlain } from 'class-transformer';
import * as http from 'http';
import argumentListResolver from './conf/argument-list-resolver';
import router from './conf/router';
import validator from './conf/validator';
import { ProductItem } from './data/entities/product-item.entity';

process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason);
});

Promise.all<DIContainerModule>([
    createTypeOrmModule(
        SqliteInMemoryConnectionOptions({
            database: './data/db.sqlite3',
            entities: ['src/app/data/entities/**/*.entity.ts', ProductItem],
        }),
    ),
]).then((modules) => {
    const [container, cleanUp] = createContainer({
        proxyFactory: TransactionalProxyFactory,
        modules: [...modules],
    });

    try {
        const server = http.createServer(
            SecureRequestListener(router, {
                container,
                argumentListResolver,
                validator,
                accessClaimsResolver: {
                    getClaims: async (request: http.IncomingMessage) => {
                        const userId = request.headers['x-principal-id'];
                        return (
                            userId &&
                            ({
                                sub: userId,
                            } as JwtClaims)
                        );
                    },
                },
                serialize: (data: unknown) => JSON.stringify(instanceToPlain(data, { enableCircularCheck: true })),
            }),
        );
        addGracefulShutdown(server, cleanUp);
        startServer(server);
    } catch (error) {
        console.error(error);
        cleanUp();
    }
});
