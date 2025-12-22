import { Router, json } from 'express';
import { loginValidate } from '../middlewares/login-validate';
import {
  consolidation,
  consultingChargedCC,
  getAllDataLpn,
  getCartonesHub,
  getDataCarton,
  getPalletvirtualRecepcionadopost,
  saveSellos
} from '../controllers/consolidation.controller';
import { add405ForRouter, add405EarlyGuard } from '../utils/add405';
import { enforceAccept } from '../middlewares/enforceAccept';
import { enforceContentType } from '../middlewares/enforceContentType'; 

class ConsolidationRoutes {
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
      loginValidate,
      enforceContentType(['application/json']), 
      json(),                                    
      consolidation
    );

    
    this.router.get(' ', consultingChargedCC);
    this.router.get(' ', getDataCarton);
    this.router.get(' ', getCartonesHub);

    
    this.router.put(
      ' ',
      enforceContentType(['application/json']),  
      json(),                                    
      saveSellos
    );

    
    this.router.post(' ', getPalletvirtualRecepcionadopost);
    this.router.get(' ', getAllDataLpn);
  }
}

const consolidationRoutes = new ConsolidationRoutes();
export default consolidationRoutes.router;
