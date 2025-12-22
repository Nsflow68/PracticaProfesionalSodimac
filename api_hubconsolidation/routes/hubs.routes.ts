import { Router } from 'express';
import { getHubs } from '../controllers/hubs.controllers';
import { add405ForRouter, add405EarlyGuard } from '../utils/add405';
import { enforceAccept } from '../middlewares/enforceAccept';

class HubsRoutes {
  router: Router;

  constructor() {
    this.router = Router();
    
    add405EarlyGuard(this.router);
    this.router.use(enforceAccept({ supported: ['application/json'] }));
    
    this.routes();
    add405ForRouter(this.router);
  }

  routes() {
    this.router.get(' ', getHubs);
  }
}

const hubsRoutes = new HubsRoutes();
export default hubsRoutes.router;
