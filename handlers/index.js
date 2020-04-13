const home = require("./home");
const signup = require("./signup");
const login = require("./login");
const newHandler = require("./new");
const auth = require("./auth");
const setting = require("./setting");
const github = require("./github");

module.exports = {
  home,
  signup,
  login,
  setting,
  auth,
  github,
  new: newHandler,
};
