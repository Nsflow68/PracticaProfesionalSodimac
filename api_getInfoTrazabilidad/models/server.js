const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dataRouter = require('../routes/data.routes');
const dbConnection = require('../db/connection');
const { enforceAccept } = require('../middlewares/enforceAccept');
const { sanitizer } = require('../middlewares/sanitizer');
const { portApp } = require("./../configServer.json");

class Server {
    constructor() {
        this.app = express();
        this.server = require('./../httpx').createServer(this.app);
        this.port = portApp;
        this.apiPaths = { reservas: '/' };
        this.conectarDB();
        this.middlewares();
        this.routes();
        this.notFound();
        this.errorHandler();
    }

    async conectarDB() {
        try {
            await dbConnection();
            if (process.env.NODE_ENV !== 'production') console.log('Database online');
        } catch (error) {
            throw new Error(error);
        }
    }

    middlewares() {
        this.app.disable('x-powered-by');
        this.app.use((req, res, next) => {
            res.setHeader('Server', 'API Server');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            next();
        });

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

        this.app.use(express.json());
        this.app.use(sanitizer);
        this.app.use(enforceAccept(['application/json']));
        if (process.env.NODE_ENV !== 'production') this.app.use(morgan('dev'));
    }

    routes() {
        this.app.use(this.apiPaths.reservas, dataRouter);
    }

    notFound() {
        this.app.use((req, res) => res.status(404).json({ msg: 'Not Found' }));
    }

    errorHandler() {
        this.app.use((err, req, res, next) => {
            if (err.message === 'CORS_ORIGIN_NOT_ALLOWED') {
                return res.status(403).json({ msg: 'Acceso denegado por CORS' });
            }
            if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
                return res.status(400).json({ msg: 'JSON malformado' });
            }
            console.error('Internal server error');
            res.status(500).json({ msg: 'Error interno del servidor' });
        });
    }

    listen() {
        this.server.listen(this.port, () => {
            if (process.env.NODE_ENV !== 'production') console.log(`App listening at port ${this.port}`);
        });
    }
}

module.exports = Server;