const mongoose = require('mongoose');

const dbConnection = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI environment variable is required');
    }

    try {
        await mongoose.connect(uri);
        if (process.env.NODE_ENV !== 'production') {
            console.log('Database connection established');
        }
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Database connection failed');
        }
        throw new Error('Error al iniciar base de datos');
    }
};

module.exports = dbConnection;
