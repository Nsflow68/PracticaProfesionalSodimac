const mongoose = require('mongoose');
const moment = require("moment");

const putSchema = mongoose.Schema({
    date: Date,
    fecha: { type: String, default: moment().format('YYYY-MM-DD HH:mm:ss') },
    type: String,
    lpn: String,
    message: Object,
    rejection: String,
    flow: String,
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'update_at'
    }
});

module.exports = mongoose.model('puts', putSchema);
