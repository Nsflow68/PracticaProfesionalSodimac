import { Sequelize } from 'sequelize';










const db = new Sequelize('trazabilidad_hub', 'trazabilidad_hub', 'tr4z4S0dtts', {
    host: '10.113.112.86',
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        dateStrings: true,
        typeCast: true,
    },
    timezone: '-03:00'

});
export default db;
