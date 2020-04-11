
module.exports = async function (req, res, next) {
  const user = req.session.user;
  if (user === undefined) {
    return res.redirect("/login");
  }
  next();
};
