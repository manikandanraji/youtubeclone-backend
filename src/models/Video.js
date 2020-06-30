const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	return sequelize.define("Video", {
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			allowNull: false,
			defaultValue: Sequelize.UUIDV4
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING
		},
		url: {
			type: DataTypes.STRING,
			allowNull: false
		}
	});
};
