const express = require("express");
const router = express.Router();
const { toggleSubscribe, getFeed, editUser, searchUser, getProfile } = require("../controllers/user");
const { protect } = require("../middlewares/auth");

router.route("/").put(protect, editUser);
router.route("/feed").get(protect, getFeed);
router.route("/search").get(protect, searchUser);
router.route("/:id").get(protect, getProfile);
router.route("/:id/togglesubscribe").get(protect, toggleSubscribe);

module.exports = router;
