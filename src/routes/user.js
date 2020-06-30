const express = require("express");
const router = express.Router();
const { getUser, toggleSubscribe } = require("../controllers/user");
const { protect } = require("../middlewares/auth");

router.route("/:username").get(getUser);
router.route("/:id/togglesubscribe").get(protect, toggleSubscribe);

module.exports = router;
