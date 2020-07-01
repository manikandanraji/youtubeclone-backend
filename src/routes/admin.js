const express = require("express");
const router = express.Router();
const { getUsers, removeUser, getVideos } = require("../controllers/admin");
const { admin, protect } = require("../middlewares/auth");

router.route("/users").get(protect, admin, getUsers);
router.route("/videos").get(protect, admin, getVideos);
router.route("/users/:username").delete(protect, admin, removeUser);

module.exports = router;
