import { Router, json } from 'express';
import { putUbication } from '../controllers/ubication.controllers';
import { add405ForRouter, add405EarlyGuard } from '../utils/add405';
import { enforceAccept } from '../middlewares/enforceAccept';
import { enforceContentType } from '../middlewares/enforceContentType';

class UbicationRoutes {
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
      putUbication
    );
  }
}

const ubicationRoutes = new UbicationRoutes();
export default ubicationRoutes.router;
