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
    this.apiPath = { consolidate: "/" };
    this.middlewares();
    this.conectarDB().catch((e) => logger.error(e));
    this.routes();
    this.globalErrorHandler();
  }

  async conectarDB() {
    await dbConnection();
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Database connection established');
    }
  }

  middlewares() {
    this.app.disable('x-powered-by');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS_ORIGIN_NOT_ALLOWED'));
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
    if (process.env.NODE_ENV !== 'production') this.app.use(morgan("dev"));
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
        logger.error('Malformed JSON request');
        return res.status(400).json({ error: 'Bad Request: Malformed JSON' });
      }
      if (err.message === 'CORS_ORIGIN_NOT_ALLOWED') {
        return res.status(403).json({ error: 'CORS policy violation' });
      }
      logger.error('Internal server error');
      if (!res.headersSent) res.status(500).json({ error: 'Internal Server Error' });
    });
  }

  listen() {
    this.server.listen(this.port, () => {
      logger.info(`App listening at port ${this.port}...`);
    });
  }
}