const { Op } = require("sequelize");
const { User, Subscription, Video } = require("../sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middlewares/asyncHandler");

exports.signup = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body);

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();

	const payload = { id: user.id };
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE
	});

	res.status(200).json({ success: true, data: token });
});

exports.login = async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ where: { email } });

	if (!user) {
		return next({
			message: "The email is not yet registered",
			statusCode: 400
		});
	}

	const passwordMatch = await bcrypt.compare(password, user.password);

	if (!passwordMatch) {
		return next({ message: "The password does not match", statusCode: 400 });
	}

	const payload = { id: user.id };
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE
	});

	res.status(200).json({ success: true, data: token });
};

exports.me = async (req, res) => {
	const user = await User.findByPk(req.user.id, {
		attributes: [
			"id",
			"firstname",
			"lastname",
			"username",
			"email",
			"avatar",
			"cover",
			"channelDescription"
		]
	});

	const subscriptions = await Subscription.findAll({
		where: { subscriber: req.user.id }
	});

	const userIds = subscriptions.map(sub => sub.subscribeTo);

	const channels = await User.findAll({
		attributes: ["id", "avatar", "username"],
		where: {
			id: {
				[Op.in]: userIds
			}
		}
	});

	user.setDataValue("channels", channels);

	res.status(200).json({ success: true, data: user });
};
