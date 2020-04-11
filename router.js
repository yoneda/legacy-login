const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const {
  auth,
  newHandler,
  homeHandler,
  signupHandler,
  loginHandler,
  settingHandler,
} = require("./handlers");

router.get("/new", asyncHandler(auth), asyncHandler(newHandler.get));
router.post("/new", asyncHandler(newHandler.post));
router.get("/", asyncHandler(auth), asyncHandler(homeHandler.get));
router.get("/signup", asyncHandler(signupHandler.get));
router.post("/signup", asyncHandler(signupHandler.post));
router.get("/login", asyncHandler(loginHandler.get));
router.post("/login", asyncHandler(loginHandler.post));
router.post("/logout", asyncHandler(settingHandler.logout));
router.get("/setting", asyncHandler(settingHandler.get));
router.post("/update", asyncHandler(settingHandler.updatePass));

module.exports = router;
