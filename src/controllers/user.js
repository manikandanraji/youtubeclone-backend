const { User, Subscription } = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({
		attributes: ["id", "firstname", "lastname", "email", "username"],
		where: { username: req.params.username }
	});

	if (!user) {
		return next({
			message: `No user found for username '${req.params.username}'`,
			statusCode: 404
		});
	}

	res.status(200).json({ success: true, data: user });
});

exports.toggleSubscribe = asyncHandler(async (req, res, next) => {
	const user = await User.findByPk(req.params.id);

	if (!user) {
		return next({
			message: `No user found for ID - '${req.params.id}'`,
			statusCode: 404
		});
	}

	const isSubscribed = await Subscription.findOne({
		where: {
			subscriber: req.user.id,
			subscribeTo: req.params.id
		}
	});

	if (isSubscribed) {
		await Subscription.destroy({
			where: {
				subscriber: req.user.id,
				subscribeTo: req.params.id
			}
		});
	} else {
		await Subscription.create({
			subscriber: req.user.id,
			subscribeTo: req.params.id
		});
	}

	res.status(200).json({ success: true, data: {} });
});
