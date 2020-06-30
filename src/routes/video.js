const express = require("express");
const router = express.Router();
const {
	newVideo,
	getVideo,
	likeVideo,
	dislikeVideo,
	addComment,
	newView,
} = require("../controllers/video");
const { protect } = require("../middlewares/auth");

router.route("/").post(protect, newVideo);
router.route("/:id").get(protect, getVideo);
router.route("/:id/like").get(protect, likeVideo);
router.route("/:id/dislike").get(protect, dislikeVideo);
router.route("/:id/comment").post(protect, addComment);
router.route("/:id/view").get(protect, newView);

module.exports = router;
