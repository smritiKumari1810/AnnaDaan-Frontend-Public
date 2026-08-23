export function attachUser(req, res, next) {
  const raw = req.cookies?.agb_user;
  let user = null;
  if (raw) {
    try {
      user = JSON.parse(raw);
      if (!user || !isValidRole(user.role)) user = null;
    } catch {
      user = null;
    }
  }
  req.user = user;
  res.locals.user = user;
  next();
}

export function requireAuth(role) {
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");
    if (role && !isValidRole(req.user.role)) {
      return res.redirect("/login");
    }
    if (role && req.user.role !== role) {
      return res.status(403).render("error", {
        title: "Access denied",
        message: "This page is only available to " + role + " accounts.",
      });
    }
    next();
  };
}

export function isValidRole(role) {
  return role === "farmer" || role === "buyer" || role === "admin";
}
