import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { supabase } from "./config/supabase.js";
import authRoutes from "./routes/auth.routes.js";
import membreRoutes from "./routes/membre.routes.js";

const app = express();

// ---- Middlewares (toujours en premier) ----
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/membres", membreRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SSA API",
    timestamp: new Date().toISOString(),
  });
});

// Test de connexion DB — à supprimer plus tard
app.get("/db-check", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("roles")
      .select("code, libelle, niveau")
      .order("niveau");

    if (error) throw error;

    res.json({
      status: "ok",
      message: "Connexion Supabase OK",
      roles_count: data.length,
      roles: data,
    });
  } catch (err) {
    next(err);
  }
});

// ---- 404 (après toutes les routes) ----
app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

// ---- Gestion centralisée des erreurs ----
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Erreur serveur interne",
  });
});

export default app;