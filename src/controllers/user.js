const { Op } = require("sequelize");
const { VideoLike, Video, User, Subscription, View } = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

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

	feed.forEach(async (video, index) => {
		const views = await View.count({ where: { videoId: video.id } });
		video.setDataValue("views", views);

		if (index >= feed.length - 1) {
			return res.status(200).json({ success: true, data: feed });
		}
	});
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

exports.searchUser = asyncHandler(async (req, res, next) => {
	if (!req.query.searchterm) {
		return next({ message: "Please enter your search term", statusCode: 400 });
	}

	const users = await User.findAll({
		attributes: ["id", "username", "avatar", "channelDescription"],
		where: {
			username: {
				[Op.substring]: req.query.searchterm
			}
		}
	});

	users.forEach(async (user, index) => {
		const subscribersCount = await Subscription.count({
			where: { subscribeTo: user.id }
		});

		const videosCount = await Video.count({
			where: { userId: user.id }
		});

		const isSubscribed = await Subscription.findOne({
			where: {
				[Op.and]: [{ subscriber: req.user.id }, { subscribeTo: user.id }]
			}
		});

		const isMe = req.user.id === user.id;

		user.setDataValue("subscribersCount", subscribersCount);
		user.setDataValue("videosCount", videosCount);
		user.setDataValue("isSubscribed", !!isSubscribed);
		user.setDataValue("isMe", isMe);

		if (index >= users.length - 1) {
			return res.status(200).json({ success: true, data: users });
		}
	});
});

exports.getProfile = asyncHandler(async (req, res, next) => {
	const user = await User.findByPk(req.params.id, {
		attributes: [
			"id",
			"username",
			"cover",
			"avatar",
			"email",
			"channelDescription"
		]
	});

	// subscribersCount, isMe, isSubscribed
	const subscribersCount = await Subscription.count({
		where: { subscribeTo: req.params.id }
	});
	user.setDataValue("subscribersCount", subscribersCount);

	const isMe = req.user.id === req.params.id;
	user.setDataValue("isMe", isMe);

	const isSubscribed = await Subscription.findOne({
		where: {
			[Op.and]: [{ subscriber: req.user.id }, { subscribeTo: req.params.id }]
		}
	});
	user.setDataValue("isSubscribed", !!isSubscribed);

	// find the channels this user is subscribed to
	const subscriptions = await Subscription.findAll({
		where: { subscriber: req.params.id }
	});
	const channelIds = subscriptions.map(sub => sub.subscribeTo);

	const channels = await User.findAll({
		attributes: ["id", "avatar", "username"],
		where: {
			id: { [Op.in]: channelIds }
		}
	});

	channels.forEach(async channel => {
		const subscribersCount = await Subscription.count({
			where: { subscribeTo: channel.id }
		});
		channel.setDataValue("subscribersCount", subscribersCount);

		const isSubscribed = await Subscription.findOne({
			where: {
				[Op.and]: [{ subscriber: req.user.id }, { subscribeTo: channel.id }]
			}
		});
		channel.setDataValue("isSubscribed", !!isSubscribed);
	});

	user.setDataValue("channels", channels);

	const videos = await Video.findAll({
		where: { userId: req.params.id },
		attributes: ["id", "title", "createdAt"]
	});

	videos.forEach(async (video, index) => {
		const views = await View.count({ where: { videoId: video.id } });
		video.setDataValue("views", views);

		if (index >= videos.length - 1) {
			user.setDataValue("videos", videos);

			return res.status(200).json({ success: true, data: user });
		}
	});
});
