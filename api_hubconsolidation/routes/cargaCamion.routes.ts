import { Router, json } from 'express';
import { andenRegister, cargaCamion, savePed } from '../controllers/cargaCamion.controllers';
import { add405ForRouter, add405EarlyGuard } from '../utils/add405';
import { enforceAccept } from '../middlewares/enforceAccept';
import { enforceContentType } from '../middlewares/enforceContentType';

class CargaRoutes {
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
      cargaCamion
    );

    this.router.put(
      ' ',
      enforceContentType(['application/json']),
      json(),
      savePed
    );

    this.router.post(
      ' ',
      enforceContentType(['application/json']),
      json(),
      andenRegister
    );
  }
}

const cargaRoutes = new CargaRoutes();
export default cargaRoutes.router;
