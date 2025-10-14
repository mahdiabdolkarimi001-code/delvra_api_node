function checkAdminAuth(req, res, next) {
  if (req.session && req.session.admin) {
    next();
  } else {
    res.redirect("/login");
  }
}

module.exports = { checkAdminAuth };
