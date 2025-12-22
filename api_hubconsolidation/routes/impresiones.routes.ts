import { Router, json } from 'express';
import { getDetailImpresion, impresiones } from '../controllers/impresiones.controllers';
import { add405ForRouter, add405EarlyGuard } from '../utils/add405';
import { enforceAccept } from '../middlewares/enforceAccept';
import { enforceContentType } from '../middlewares/enforceContentType';

class ImpressionRoutes {
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
      impresiones
    );

    this.router.get(' ', getDetailImpresion);
  }
}

const impressionRoutes = new ImpressionRoutes();
export default impressionRoutes.router;
