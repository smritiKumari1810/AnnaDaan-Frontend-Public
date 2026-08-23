import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../utils/auth.js";

const router = express.Router();

const MARKET_PRICES = {
  tomato: 40,
  potato: 25,
  onion: 35,
  wheat: 28,
  rice: 45,
  maize: 22,
};

function marketPriceFor(cropName) {
  if (!cropName) return null;
  return MARKET_PRICES[cropName.trim().toLowerCase()] ?? null;
}

router.get("/listings", async (req, res) => {
  const { crop, location, min_price, max_price } = req.query;

  let query = supabase
    .from("listings")
    .select("id, crop_name, quantity, price_per_unit, location_name, lat, lng, photo_url, created_at")
    .order("created_at", { ascending: false });

  if (crop) query = query.ilike("crop_name", `%${crop}%`);
  if (location) query = query.ilike("location_name", `%${location}%`);
  if (min_price) query = query.gte("price_per_unit", Number(min_price));
  if (max_price) query = query.lte("price_per_unit", Number(max_price));

  const { data: listings, error } = await query;

  res.render("buyer-dashboard", {
    title: "Browse produce",
    listings: listings || [],
    filters: { crop, location, min_price, max_price },
    error: error ? error.message : null,
  });
});

router.get("/listings/:id", async (req, res) => {
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, farmer:users!listings_farmer_id_fkey(name, location_name)")
    .eq("id", req.params.id)
    .single();

  if (error || !listing) {
    return res.status(404).render("error", {
      title: "Listing not found",
      message: "We couldn't find that produce listing.",
    });
  }

  const marketPrice = marketPriceFor(listing.crop_name);
  res.render("listing-detail", {
    title: listing.crop_name,
    listing,
    marketPrice,
  });
});

router.post("/listings", requireAuth("farmer"), async (req, res) => {
  const { crop_name, quantity, price_per_unit, location_name, lat, lng, photo_url } = req.body;
  try {
    const { error } = await supabaseAdmin.from("listings").insert({
      farmer_id: req.user.id,
      crop_name,
      quantity: Number(quantity),
      price_per_unit: Number(price_per_unit),
      location_name: location_name || null,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      photo_url: photo_url || null,
    });
    if (error) throw error;
    res.redirect("/farmer");
  } catch (err) {
    res.status(400).render("error", {
      title: "Could not save listing",
      message: err.message,
    });
  }
});

export default router;
