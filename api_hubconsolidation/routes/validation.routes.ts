import { Router, json } from 'express';
import { logicaValidacionPH } from '../controllers/logicaValidacionPH.controllers';
import { add405ForRouter, add405EarlyGuard } from '../utils/add405';
import { enforceAccept } from '../middlewares/enforceAccept';
import { enforceContentType } from '../middlewares/enforceContentType';

class ValidationRoutes {
  router: Router;

  constructor() {
    this.router = Router();
    
    add405EarlyGuard(this.router);
    this.router.use(enforceAccept({ supported: ['application/json'] }));
    this.routes();
    add405ForRouter(this.router);
  }

  routes() {
    this.router.post(
      ' ',
      enforceContentType(['application/json']),
      json(),
      logicaValidacionPH
    );
  }
}

const validationRoutes = new ValidationRoutes();
export default validationRoutes.router;
