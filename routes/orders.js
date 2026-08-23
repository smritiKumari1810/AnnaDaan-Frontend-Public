import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../utils/auth.js";
import { findNearestHub } from "../utils/haversine.js";

const router = express.Router();

router.post("/orders", requireAuth("buyer"), async (req, res) => {
  const { listing_id, quantity } = req.body;
  try {
    const { data: buyer } = await supabaseAdmin
      .from("users")
      .select("id, lat, lng")
      .eq("id", req.user.id)
      .single();

    const { data: hubs, error: hubErr } = await supabaseAdmin
      .from("hubs")
      .select("id, name, lat, lng");
    if (hubErr) throw hubErr;

    const match = findNearestHub({ lat: buyer?.lat, lng: buyer?.lng }, hubs || []);
    const assignedHubId = match ? match.hub.id : null;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        buyer_id: req.user.id,
        listing_id,
        quantity: Number(quantity) || 1,
        status: "confirmed",
        assigned_hub_id: assignedHubId,
      })
      .select("id")
      .single();
    if (error) throw error;

    res.redirect(`/orders/${order.id}`);
  } catch (err) {
    res.status(400).render("error", {
      title: "Order failed",
      message: err.message,
    });
  }
});

router.get("/orders/:id", requireAuth(), async (req, res) => {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select(
      `*,
       buyer:users!orders_buyer_id_fkey(name, lat, lng),
       listing:listings!orders_listing_id_fkey(crop_name, price_per_unit, quantity),
       hub:hubs!orders_assigned_hub_id_fkey(name, lat, lng)`
    )
    .eq("id", req.params.id)
    .single();

  if (error || !order) {
    return res.status(404).render("error", {
      title: "Order not found",
      message: "We couldn't find that order.",
    });
  }

  res.render("order-confirmation", { title: "Order confirmed", order });
});

export default router;
