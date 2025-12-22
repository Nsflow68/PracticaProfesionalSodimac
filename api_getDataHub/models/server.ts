import express, { Application, Express } from 'express';
import { createServer } from "./../httpx";
import userRoutes from '../routes/hub.routes';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import db from '../db/connection';
import configServer from "./../config.json";
import mongoSanitize from 'express-mongo-sanitize';
const xss = require('xss-clean');



export default class Server {

    private app: Express;
    private server: Express;
    private port: string;
    private apiPaths = {
        hub: '/api/hub'
    }


    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.port = configServer.portApp;

        
        this.dbConnection();
        this.middlewares();
        this.routes();
        this.handleErrors();

    }

    async dbConnection() {

        try {

            await db.authenticate();
            console.log('Database online');

        } catch (error: any) {
            throw new Error(error);
        }

    }

    middlewares() {

        
        
        const allowedOrigins = [
            'https://hansolo.dda.sodimac.cl',
            'https://thanos.dda.sodimac.cl',
            'https://kurama.dda.sodimac.cl',
            'https://trazabilidad-hub.dda.sodimac.cl'
        ];

        this.app.use(cors({
            origin: (origin, callback) => {
                
                
                if (!origin || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }

                const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
                return callback(new Error(msg));
            }
        }));

        this.app.use(helmet());

        
        this.app.use((req, res, next) => {
            
            res.removeHeader('X-Powered-By');
            res.removeHeader('X-Kong-Upstream-Latency');
            res.removeHeader('X-Kong-Proxy-Latency');
            res.removeHeader('X-Kong-Request-Id');
            res.removeHeader('Via');

            
            res.setHeader('Server', 'API Server');
            next();
        });

        
        this.app.use(express.json({ limit: '100kb' }));
        this.app.use(express.urlencoded({ extended: false, limit: '50kb' }));

        
        this.app.use(mongoSanitize());
        this.app.use(xss());

        
        this.app.disable('x-powered-by');

        
        if (process.env.NODE_ENV !== 'production') {
            this.app.use(morgan('dev'));
        } else {
            
            this.app.use(morgan('combined'));
        }

        
        this.app.use(express.static('public'));
    }


    routes() {
        this.app.use(this.apiPaths.hub, userRoutes)

    }

    
    
    


    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en puerto ' + this.port);
        })
    }

    handleErrors() {
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {

            
            if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
                console.error('Bad JSON request:', err.message);
                return res.status(400).json({
                    error: "bad_request",
                    message: "Invalid JSON format"
                });
            }

            if (err.message === 'The CORS policy for this site does not allow access from the specified Origin.') {
                return res.status(500).json({
                    error: "cors_error",
                    message: "CORS policy violation" 
                });
            }

            
            console.error('SERVER ERROR:', err);

            
            return res.status(500).json({
                error: "internal_server_error",
                message: "An unexpected error occurred. Please try again later."
            });

        });
    }

}
