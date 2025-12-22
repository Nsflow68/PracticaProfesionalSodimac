import {Schema, model} from 'mongoose';

const settingSchema = new Schema({
    idApp:String,
    portApp: Number,
    nameApp:String
});

export default model('appsettings', settingSchema);