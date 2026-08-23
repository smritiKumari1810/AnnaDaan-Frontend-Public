import express from "express";

const router = express.Router();

router.get("/api/forecast", (req, res) => {
  const months = ["Sep", "Oct", "Nov", "Dec"];
  const base = { Tomato: 1200, Onion: 900, Wheat: 1500 };

  const data = [];
  for (const crop of Object.keys(base)) {
    months.forEach((month, i) => {
      const seasonal = Math.round(base[crop] * (1 + 0.15 * Math.sin(i)));
      data.push({ crop, month, predicted_demand: seasonal });
    });
  }

  res.json(data);
});

export default router;
