import {Schema, model} from 'mongoose';

const consolidadoHub = new Schema({
    jaula: Number,
    date: { type: Date, default: new Date() },
    datos: Object,
});

export default model('consolidadoHub', consolidadoHub);
