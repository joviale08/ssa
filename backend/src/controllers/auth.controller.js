import { z } from "zod";
import * as authService from "../services/auth.service.js";

const loginSchema = z.object({
  identifiant: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.json(result);
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "Données invalides",
        details: err.issues.map((i) => ({ field: i.path[0], message: i.message })),
      });
    }
    next(err);
  }
}
export async function me(req, res, next) {
  try {
    // req.user.id vient du middleware authenticate
    const user = await authService.getMe(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  // Avec des JWT stateless, le logout est géré côté client
  // (le client supprime ses tokens). On renvoie juste une confirmation.
  res.json({ message: "Déconnexion réussie" });
}