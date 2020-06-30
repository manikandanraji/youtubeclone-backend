const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => (
	sequelize.define('View', {
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		}
	})
)
