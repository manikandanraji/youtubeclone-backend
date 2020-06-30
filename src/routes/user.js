const express = require("express");
const router = express.Router();
const { getUser, toggleSubscribe, getFeed, editUser } = require("../controllers/user");
const { protect } = require("../middlewares/auth");

router.route("/").put(protect, editUser);
router.route("/feed").get(protect, getFeed);
router.route("/:username").get(getUser);
router.route("/:id/togglesubscribe").get(protect, toggleSubscribe);

module.exports = router;
