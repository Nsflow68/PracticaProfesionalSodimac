import { Sequelize } from 'sequelize';

const required = ['SQLHOST', 'SQLUSER', 'SQLPASS', 'SQLDB'];
for (const name of required) {
    if (!process.env[name]) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
}

const db = new Sequelize(
    process.env.SQLDB!,
    process.env.SQLUSER!,
    process.env.SQLPASS!,
    {
        host: process.env.SQLHOST,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
        },
        timezone: '-03:00'
    }
);

export default db;
