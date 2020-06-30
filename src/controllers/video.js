const { User, Video, VideoLike, Comment } = require("../sequelize");
const asyncHandler = require("../middlewares/asyncHandler");

exports.newVideo = asyncHandler(async (req, res, next) => {
	const video = await Video.create({
		...req.body,
		userId: req.user.id
	});

	res.status(200).json({ success: true, data: video });
});

exports.getVideo = asyncHandler(async (req, res, next) => {
	const video = await Video.findByPk(req.params.id);

	if (!video) {
		return next({
			message: `No video found for ID - ${req.params.id}`,
			statusCode: 404
		});
	}

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

	if(!video) {
		return next({ message: `No video found for ID - ${req.params.id}`, statusCode: 404 });
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

	if(!video) {
		return next({ message: `No video found for ID - ${req.params.id}`, statusCode: 404 });
	}

	const comment = await Comment.create({
		text: req.body.text,
		userId: req.user.id,
		videoId: req.params.id
	});

	res.status(200).json({ success: true, data: comment });
});
