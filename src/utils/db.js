const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_URI, { logging: false });

module.exports = sequelize;
