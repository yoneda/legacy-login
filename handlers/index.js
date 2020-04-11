const home = require("./home");
const signup = require("./signup");
const login = require("./login");
const newHandler = require("./new");
const auth = require("./auth");
const setting = require("./setting");

module.exports = {
  home,
  signup,
  login,
  setting,
  auth,
  new: newHandler,
};
