import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";

const app = express();

// Middlewares de sécurité et parsing
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Route de santé (Milestone S0)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SSA API",
    timestamp: new Date().toISOString(),
  });
});

// Gestion des routes inexistantes
app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable" });
});

// Gestion centralisée des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Erreur serveur interne",
  });
});

export default app;