import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { attachUser } from "./utils/auth.js";
import authRoutes from "./routes/auth.js";
import listingRoutes from "./routes/listings.js";
import orderRoutes from "./routes/orders.js";
import apiRoutes from "./routes/api.js";
import dashboardRoutes from "./routes/dashboards.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(attachUser);

app.use("/", dashboardRoutes);
app.use("/", authRoutes);
app.use("/", listingRoutes);
app.use("/", orderRoutes);
app.use("/", apiRoutes);

app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page not found",
    message: "The page you were looking for doesn't exist.",
  });
});

app.listen(PORT, () => {
  console.log(`AnnaDaan running at http://localhost:${PORT}`);
});
