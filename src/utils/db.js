const { Sequelize } = require("sequelize");
const User = require("../models/User");
const Video = require("../models/Video");

const sequelize = new Sequelize(process.env.POSTGRES_URI, { logging: false });

// establish relationship between models
User.hasMany(Video);
Video.belongsTo(User);

module.exports = sequelize;
