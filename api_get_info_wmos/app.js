const express = require('express');
const app = express();
app.disable('x-powered-by');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const getDataWmos = require('./controller/getDataWmos/getDataWmos');
const settingModel = require('./storageData/model/settingModel');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const urlencodedParser = bodyParser.urlencoded({ limit: '50mb', extended: true });


app.enable('trust proxy');

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); 
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(helmet({
    hsts: {
        maxAge: 31536000, 
        includeSubDomains: true,
        preload: true
    },
    noSniff: true
}));

const router = express.Router();

app.use(urlencodedParser)
app.use(bodyParser.json({ limit: '50mb' }));


app.use(mongoSanitize());


app.use(xss());

app.use(router);



app.use(getDataWmos);


app.use((err, req, res, next) => {
    console.error(err); 

    
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'bad_request', message: 'Invalid JSON syntax' });
    }

    
    if (err.message === 'The CORS policy for this site does not allow access from the specified Origin.') {
        return res.status(500).json({ error: 'cors_error', message: err.message });
    }

    
    const statusCode = err.status || 500;
    const errorMessage = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message; 

    res.status(statusCode).json({
        error: 'internal_server_error',
        message: errorMessage
    });
});

const server = require('./httpx').createServer(app);

if (!process.env.MONGO_URI || !process.env.ID_APP) {
    throw new Error('MONGO_URI and ID_APP environment variables are required');
}

mongoose.connect(process.env.MONGO_URI);

settingModel.findOne({ idApp: process.env.ID_APP })
    .then(doc => {
        if (!doc) {
            console.error('Settings not found');
            return;
        }
        global.__setting = doc._doc;
        global.__nameProject = doc._doc.nameApp;

        server.listen(doc._doc.portApp, () => {
            console.log(`${doc._doc.nameApp.toUpperCase()} escuchando en puerto ${server.address().port}`);
        });
    })
    .catch(error => {
        console.error('Error loading settings:', error);
        process.exit(1);
    });



process.on('SIGINT', () => {

    console.info('Señal SIGINT recibida.');

    
    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1)
        }
    });

    setTimeout(() => {
        mongoose.connection.close(() => {
            console.log('Conexión de Mongoose desconectada');
            process.exit(0)
        })
    }, 30000);
});

process.on('message', (msg) => {
    if (msg == 'shutdown') {
        console.log('Cerrando todas las conexiones ...');
        setTimeout(() => {
            console.log('Terminado de cerrar las conexiones.');
            process.exit(0)
        }, 30000);
    }
});
