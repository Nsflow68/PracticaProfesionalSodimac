const mongoose = require('mongoose')


const uriLocal = `mongodb://${process.env.USER}:${process.env.PASS}@${process.env.IP}:${process.env.PORT}/${process.env.SCHEMA}`




const dbConnection = async() => {
    try {
        mongoose.connect(
            uriLocal,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                
                
            }
        ).catch(e => console.error(e));
        if (process.env.NODE_ENV !== 'production') {
            console.log('Base de datos online activa');
        }

    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(error);
        }
        throw new Error('Error al iniciar base de datos');
    }
}

module.exports=dbConnection;
