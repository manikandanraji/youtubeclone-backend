const express = require("express");
const router = express.Router();
const { getUsers, removeUser, getVideos } = require("../controllers/admin");
const { admin, protect } = require("../middlewares/auth");

router.route("/users").get(protect, getUsers);
router.route("/videos").get(protect,getVideos);
router.route("/users/:username").delete(protect, removeUser);

module.exports = router;
