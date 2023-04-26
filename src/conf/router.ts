import { SimpleRouter } from '@matchmakerjs/matchmaker';
import { IndexController } from '../app/controllers/index.controller';
import { ProductItemController } from '../app/controllers/product-item.controller';

export default SimpleRouter.fromControllers([IndexController, ProductItemController]);
