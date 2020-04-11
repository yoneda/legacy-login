const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { auth, home, signup, login, setting, new:newHandler} = require("./handlers");

router.get("/", asyncHandler(auth), asyncHandler(home.get));
router.get("/setting", asyncHandler(auth), asyncHandler(setting.get));
router.get("/signup", asyncHandler(signup.get));
router.post("/signup", asyncHandler(signup.post));
router.get("/login", asyncHandler(login.get));
router.post("/login", asyncHandler(login.post));
router.post("/logout", asyncHandler(setting.logout));
router.post("/update", asyncHandler(setting.updatePass));
router.get("/new", asyncHandler(auth), asyncHandler(newHandler.get));
router.post("/new", asyncHandler(newHandler.post));

module.exports = router;
