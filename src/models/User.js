const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	return sequelize.define("User", {
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: Sequelize.UUIDV4
		},
		firstname: {
			type: DataTypes.STRING,
			allowNull: false
		},
		lastname: {
			type: DataTypes.STRING,
			allowNull: false
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				min: 6
			}
		},
		avatar: {
			type: DataTypes.STRING,
			defaultValue:
				"https://res.cloudinary.com/douy56nkf/image/upload/v1593256483/instaclone/g519nj8a5bgmsr5cyrw7.png"
		},
		cover: {
			type: DataTypes.STRING,
			defaultValue:
				"https://res.cloudinary.com/douy56nkf/image/upload/v1588128318/twitter-build/s4fftpwcaxpf19vh6zdo.png"
		},
		channelDescription: {
			type: DataTypes.STRING
		},
		isAdmin: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		}
	});
};
