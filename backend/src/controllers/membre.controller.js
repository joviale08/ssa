import { z } from "zod";
import * as membreService from "../services/membre.service.js";

// Validation des données d'entrée (Zod)
const createMembreSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  telephone: z.string().optional().nullable(),
  telephone_remarque: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable(),
  date_naissance: z.string().optional().nullable(),  // format "YYYY-MM-DD"
  sexe: z.enum(["M", "F"]).optional().nullable(),
  adresse: z.string().optional().nullable(),
  zone_residence: z.string().optional().nullable(),
  departement_id: z.string().uuid().optional().nullable(),
  encadreur_id: z.string().uuid().optional().nullable(),
  statut: z.enum(["NouveauVenu", "Regulier", "Inactif"]).optional(),
  date_integration: z.string().optional(),  // format "YYYY-MM-DD"
});

export async function create(req, res, next) {
  try {
    const data = createMembreSchema.parse(req.body);

    // Règle métier : un moyen de contact est nécessaire
    // (téléphone du membre OU précision tuteur)
    if (!data.telephone) {
      return res.status(400).json({
        error: "Données invalides",
        details: [{ field: "telephone", message: "Un numéro de téléphone est requis" }],
      });
    }

    const membre = await membreService.createMembre(data);
    res.status(201).json({ membre });
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
export async function list(req, res, next) {
  try {
    // req.user vient du middleware authenticate
    const membres = await membreService.listMembres(req.user);
    res.json({ membres, count: membres.length });
  } catch (err) {
    next(err);
  }
}
export async function getOne(req, res, next) {
  try {
    const membre = await membreService.getMembreById(req.params.id, req.user);
    res.json({ membre });
  } catch (err) {
    next(err);
  }
}
// Schéma de modification : tous les champs sont optionnels
// (on ne modifie que ce qu'on envoie)
const updateMembreSchema = z.object({
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  telephone: z.string().optional().nullable(),
  telephone_remarque: z.string().optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable(),
  date_naissance: z.string().optional().nullable(),
  sexe: z.enum(["M", "F"]).optional().nullable(),
  adresse: z.string().optional().nullable(),
  zone_residence: z.string().optional().nullable(),
  departement_id: z.string().uuid().optional().nullable(),
  encadreur_id: z.string().uuid().optional().nullable(),
  statut: z.enum(["NouveauVenu", "Regulier", "Inactif"]).optional(),
  date_integration: z.string().optional(),
});

export async function update(req, res, next) {
  try {
    const data = updateMembreSchema.parse(req.body);
    const membre = await membreService.updateMembre(req.params.id, data, req.user);
    res.json({ membre });
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
export async function desactiver(req, res, next) {
  try {
    const membre = await membreService.desactiverMembre(req.params.id, req.user);
    res.json({ message: "Membre désactivé", membre });
  } catch (err) {
    next(err);
  }
}