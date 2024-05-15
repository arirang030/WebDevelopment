"use strict";

const express = require('express');
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/login", ctrl.output.login);
router.get("/register", ctrl.output.register);
router.get("/map", ctrl.output.map);

router.post("/login", ctrl.process.login);
router.post("/register", ctrl.process.register);

module.exports = router;