import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { isValidRole } from "../utils/auth.js";

const router = express.Router();

router.get("/signup", (req, res) => {
  const role = req.query.role === "farmer" ? "farmer" : "buyer";
  res.render("auth", { title: "Sign up", mode: "signup", role, error: null });
});

router.get("/login", (req, res) => {
  res.render("auth", { title: "Log in", mode: "login", role: "buyer", error: null });
});

router.post("/signup", async (req, res) => {
  const { name, email, password, role, lat, lng } = req.body;
  const accountRole = role === "farmer" ? "farmer" : "buyer";
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: accountRole } },
    });
    if (error) throw error;

    const authUser = data.user;

    const { error: profileErr } = await supabaseAdmin.from("users").insert({
      id: authUser?.id,
      name,
      email,
      role: accountRole,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
    });
    if (profileErr) throw profileErr;

    setUserCookie(res, { id: authUser?.id, name, email, role: accountRole });
    return res.redirect(accountRole === "farmer" ? "/farmer" : "/buyer");
  } catch (err) {
    return res.status(400).render("auth", {
      title: "Sign up",
      mode: "signup",
      role: role || "buyer",
      error: err.message || "Could not create your account.",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("users")
      .select("id, name, email, role")
      .eq("id", data.user.id)
      .limit(1);
    if (profileErr) throw profileErr;
    let profile = profiles?.[0];

    if (!profile) {
      const { data: emailProfiles, error: emailProfileErr } = await supabaseAdmin
        .from("users")
        .select("id, name, email, role")
        .eq("email", email)
        .limit(1);
      if (emailProfileErr) throw emailProfileErr;
      profile = emailProfiles?.[0];
    }

    if (!profile || !isValidRole(profile.role)) {
      throw new Error(
        "No valid profile was found for this account. Please create the account again."
      );
    }

    setUserCookie(res, profile);
    return res.redirect(profile.role === "farmer" ? "/farmer" : "/buyer");
  } catch (err) {
    return res.status(400).render("auth", {
      title: "Log in",
      mode: "login",
      role: "buyer",
      error: err.message || "Invalid email or password.",
    });
  }
});

router.post("/logout", async (req, res) => {
  await supabase.auth.signOut().catch(() => {});
  res.clearCookie("agb_user");
  res.redirect("/");
});

function setUserCookie(res, user) {
  res.cookie(
    "agb_user",
    JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }),
    { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 7 }
  );
}

export default router;
