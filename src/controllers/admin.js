const { User } = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getUsers = asyncHandler(async (req, res, next) => {
	const users = await User.findAll({
		attributes: ["id", "firstname", "lastname", "username", "email"]
	});

	res.status(200).json({ success: true, data: users });
});

exports.removeUser = asyncHandler(async (req, res, next) => {
	await User.destroy({
		where: { username: req.params.username }
	});

	res.status(200).json({ success: true, data: {} });
});
