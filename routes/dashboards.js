import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../utils/auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("landing", { title: "AnnaDaan — farm to buyer, directly" });
});

router.get("/farmer", requireAuth("farmer"), async (req, res) => {
  const { data: listings } = await supabaseAdmin
    .from("listings")
    .select("id, crop_name, quantity, price_per_unit, location_name, created_at")
    .eq("farmer_id", req.user.id)
    .order("created_at", { ascending: false });

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select(
      `id, quantity, status, created_at,
       listing:listings!orders_listing_id_fkey(crop_name, farmer_id),
       buyer:users!orders_buyer_id_fkey(name)`
    )
    .order("created_at", { ascending: false });

  const incoming = (orders || []).filter(
    (o) => o.listing && o.listing.farmer_id === req.user.id
  );

  res.render("farmer-dashboard", {
    title: "Farmer dashboard",
    listings: listings || [],
    orders: incoming,
  });
});

router.get("/buyer", (req, res) => res.redirect("/listings"));

router.get("/forecast", (req, res) => {
  res.render("forecast", { title: "Demand forecast" });
});

router.get("/admin", requireAuth("admin"), async (req, res) => {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select(
      `id, quantity, status, created_at,
       buyer:users!orders_buyer_id_fkey(name),
       listing:listings!orders_listing_id_fkey(crop_name),
       hub:hubs!orders_assigned_hub_id_fkey(name)`
    )
    .order("created_at", { ascending: false });

  res.render("admin-dashboard", { title: "Admin", orders: orders || [] });
});

export default router;
