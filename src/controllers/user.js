const { Op } = require("sequelize");
const { VideoLike, Video, User, Subscription, View } = require("../sequelize");
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
	if (req.user.id === req.params.id) {
		return next({
			message: "You cannot to subscribe to your own channel",
			statusCode: 400
		});
	}

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

exports.getFeed = asyncHandler(async (req, res, next) => {
	const subscribedTo = await Subscription.findAll({
		where: {
			subscriber: req.user.id
		}
	});

	const subscriptions = subscribedTo.map(sub => sub.subscribeTo);
	subscriptions.push(req.user.id);

	const feed = await Video.findAll({
		include: {
			model: User,
			attributes: ["id", "avatar", "username"]
		},
		where: {
			userId: {
				[Op.in]: subscriptions
			}
		}
	});

	res.status(200).json({ success: true, data: feed });
});

exports.editUser = asyncHandler(async (req, res, next) => {
	await User.update(req.body, {
		where: { id: req.user.id }
	});

	const user = await User.findByPk(req.user.id, {
		attributes: [
			"id",
			"firstname",
			"lastname",
			"username",
			"channelDescription",
			"avatar",
			"cover",
			"email"
		]
	});

	res.status(200).json({ success: true, data: user });
});
