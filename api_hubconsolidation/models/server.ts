import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import { dbConnection } from "../configs/connection.db";
import consolidationRouter from "../routes/consolidation.routes";
import impressionRoutes from "../routes/impresiones.routes";
import cargaCamionRoutes from "../routes/cargaCamion.routes";
import validationRoutes from "../routes/validation.routes";
import { createServer } from "./../httpx";
import ubicationRoutes from "../routes/ubication.routes";
import userLoginRoutes from "../routes/userLogin.routes";
import { ConfigServer } from "../configs/configs";
import hubsRoutes from "../routes/hubs.routes";
import { logger } from "../utils/logger";
import mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean');

export default class Server {
  private app: Express;
  private server: Express;
  private port: string;
  public apiPath: any;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = process.env.PORT ?? ConfigServer.port;
    this.apiPath = {
      consolidate: "/",
    };

    this.middlewares();
    this.conectarDB().catch((e) => logger.error(e));
    this.routes();
    this.globalErrorHandler(); 
  }

  async conectarDB() {
    await dbConnection();
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(process.env.URLSERVER);
      logger.debug(process.env.SQLHOST);
    }
  }

  middlewares() {
    
    this.app.disable('x-powered-by');

    
    const allowedOrigins = [
      'https://hansolo.dda.sodimac.cl',
      'https://thanos.dda.sodimac.cl',
      'https://kurama.dda.sodimac.cl',
      'https://obito.dda.sodimac.cl',
      'https://trazabilidad-hub.dda.sodimac.cl'
    ];

    this.app.use(cors({
      origin: (origin, callback) => {
        
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          return callback(null, true);
        } else {
          return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
        }
      }
    }));

    
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      
      res.removeHeader('Server');
      next();
    });

    
    this.app.use(mongoSanitize());

    
    this.app.use(xss());

    
    this.app.use(express.json({ limit: "50mb" }));

    if (process.env.NODE_ENV !== 'production') {
      this.app.use(morgan("dev"));
    }
  }

  routes() {
    this.app.use(this.apiPath.consolidate, consolidationRouter);
    this.app.use(this.apiPath.consolidate, impressionRoutes);
    this.app.use(this.apiPath.consolidate, cargaCamionRoutes);
    this.app.use(this.apiPath.consolidate, validationRoutes);
    this.app.use(this.apiPath.consolidate, ubicationRoutes);
    this.app.use(this.apiPath.consolidate, userLoginRoutes);
    this.app.use(this.apiPath.consolidate, hubsRoutes);
  }

  globalErrorHandler() {
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      
      if (err instanceof SyntaxError && 'body' in err) {
        logger.error(`JSON malformado: ${err.message}`);
        return res.status(400).json({ error: 'Bad Request: Malformed JSON' });
      }

      
      logger.error(err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }

  listen() {
    this.server.listen(this.port, () => {
      logger.info(`App listening at port ${this.port}...`);
    });
  }
}
