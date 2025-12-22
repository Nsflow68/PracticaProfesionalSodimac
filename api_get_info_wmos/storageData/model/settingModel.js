const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    idApp: String,
    portApp: Number,
    nameApp: String,
    oracleConexion: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('appsettings', settingSchema);
