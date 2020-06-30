const express = require("express");
const router = express.Router();
const { getUsers, removeUser, getVideos } = require("../controllers/admin");

router.route("/users").get(getUsers);
router.route("/videos").get(getVideos);
router.route("/users/:username").delete(removeUser);

module.exports = router;
