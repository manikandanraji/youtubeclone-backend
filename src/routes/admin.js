const express = require("express");
const router = express.Router();
const { getUsers, removeUser } = require("../controllers/admin");

router.route("/users").get(getUsers);
router.route("/users/:username").delete(removeUser);

module.exports = router;
