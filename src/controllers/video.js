const { Op } = require("sequelize");
const {
	User,
	Video,
	VideoLike,
	Comment,
	View,
	Subscription
} = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.newVideo = asyncHandler(async (req, res, next) => {
	const video = await Video.create({
		...req.body,
		userId: req.user.id
	});

	res.status(200).json({ success: true, data: video });
});

exports.getVideo = asyncHandler(async (req, res, next) => {
	const video = await Video.findByPk(req.params.id, {
		include: [
			{
				model: User,
				attributes: ["id", "username", "avatar"]
			}
		]
	});

	if (!video) {
		return next({
			message: `No video found for ID - ${req.params.id}`,
			statusCode: 404
		});
	}

	const comments = await video.getComments({
		attributes: ["id", "text", "createdAt"],
		include: [
			{
				model: User,
				attributes: ["id", "username", "avatar"]
			}
		]
	});

	// isLiked, isDisliked, isSubscribed, videoMine
	const isLiked = await VideoLike.findOne({
		where: {
			[Op.and]: [
				{ videoId: req.params.id },
				{ userId: req.user.id },
				{ like: 1 }
			]
		}
	});

	const isDisliked = await VideoLike.findOne({
		where: {
			[Op.and]: [
				{ videoId: req.params.id },
				{ userId: req.user.id },
				{ like: -1 }
			]
		}
	});

	const commentsCount = await Comment.count({
		where: {
			videoId: req.params.id
		}
	});

	const likesCount = await VideoLike.count({
		where: {
			[Op.and]: [{ videoId: req.params.id }, { like: 1 }]
		}
	});

	const dislikesCount = await VideoLike.count({
		where: {
			[Op.and]: [{ videoId: req.params.id }, { like: -1 }]
		}
	});

	const viewsCount = await View.count({
		where: {
			videoId: req.params.id
		}
	});

	const isSubscribed = await Subscription.findOne({
		where: {
			subscriber: req.user.id,
			subscribeTo: video.userId
		}
	});

	const isVideoMine = req.user.id === video.userId;

	// likesCount, disLikesCount, viewsCount
	video.setDataValue("comments", comments);
	video.setDataValue("commentsCount", commentsCount);
	video.setDataValue("isLiked", !!isLiked);
	video.setDataValue("isDisliked", !!isDisliked);
	video.setDataValue("likesCount", likesCount);
	video.setDataValue("dislikesCount", dislikesCount);
	video.setDataValue("viewsCount", viewsCount);
	video.setDataValue("isVideoMine", isVideoMine);
	video.setDataValue("isSubscribed", !!isSubscribed);

	res.status(200).json({ success: true, data: video });
});

exports.likeVideo = asyncHandler(async (req, res, next) => {
	const video = await Video.findByPk(req.params.id);

	if (!video) {
		return next({
			message: `No video found for ID - ${req.params.id}`,
			statusCode: 404
		});
	}

	const liked = await VideoLike.findOne({
		where: {
			userId: req.user.id,
			videoId: req.params.id
		}
	});

	let like;

	if (liked) {
		liked.like = 1;
		await liked.save();
	} else {
		like = await VideoLike.create({
			userId: req.user.id,
			videoId: req.params.id,
			like: 1
		});
	}

	res.json({ success: true, data: liked ? liked : like });
});

exports.dislikeVideo = asyncHandler(async (req, res, next) => {
	const video = await Video.findByPk(req.params.id);

	if (!video) {
		return next({
			message: `No video found for ID - ${req.params.id}`,
			statusCode: 404
		});
	}

	const liked = await VideoLike.findOne({
		where: {
			userId: req.user.id,
			videoId: req.params.id
		}
	});

	let dislike;

	if (liked) {
		liked.like = -1;
		await liked.save();
	} else {
		dislike = await VideoLike.create({
			userId: req.user.id,
			videoId: req.params.id,
			like: -1
		});
	}

	res.json({ success: true, data: liked ? liked : dislike });
});

exports.addComment = asyncHandler(async (req, res, next) => {
	const video = await Video.findByPk(req.params.id);

	if (!video) {
		return next({
			message: `No video found for ID - ${req.params.id}`,
			statusCode: 404
		});
	}

	const comment = await Comment.create({
		text: req.body.text,
		userId: req.user.id,
		videoId: req.params.id
	});

	res.status(200).json({ success: true, data: comment });
});

exports.newView = asyncHandler(async (req, res, next) => {
	const video = await Video.findByPk(req.params.id);

	if (!video) {
		return next({
			message: `No video found for ID - ${req.params.id}`,
			statusCode: 404
		});
	}

	const viewed = await View.findOne({
		where: {
			userId: req.user.id,
			videoId: req.params.id
		}
	});

	if (viewed) {
		return next({ message: "You already viewed this video", statusCode: 400 });
	}

	await View.create({
		userId: req.user.id,
		videoId: req.params.id
	});

	res.status(200).json({ success: true, data: {} });
});

exports.searchVideo = asyncHandler(async (req, res, next) => {
	if (!req.query.searchterm) {
		return next({ message: "Please enter the searchterm", statusCode: 400 });
	}

	const videos = await Video.findAll({
		include: { model: User, attributes: ["id", "avatar", "username"] },
		where: {
			[Op.or]: {
				title: {
					[Op.substring]: req.query.searchterm
				},
				description: {
					[Op.substring]: req.query.searchterm
				}
			}
		}
	});

	videos.forEach(async (video, index) => {
		const views = await View.count({ where: { videoId: video.id } });
		video.setDataValue('views', views);

		if (index >= videos.length - 1) {
			return res.status(200).json({ success: true, data: videos });
		}
	});
});
