import { Router } from "express";
import * as membreController from "../controllers/membre.controller.js";
import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Créer un membre : Encadreur, Leader, PR, Pasteur (EF14)
router.post(
  "/",
  authenticate,
  requireRole("ENCADREUR", "LEADER", "PR", "PASTEUR"),
  membreController.create
);
// Lister les membres : tous les rôles connectés (le filtrage se fait dans le service)
router.get(
  "/",
  authenticate,
  membreController.list
);
// Consulter un membre précis (vérification de périmètre dans le service)
router.get(
  "/:id",
  authenticate,
  membreController.getOne
);
// Modifier un membre : Encadreur, Leader, PR, Pasteur (EF15)
router.put(
  "/:id",
  authenticate,
  requireRole("ENCADREUR", "LEADER", "PR", "PASTEUR"),
  membreController.update
);
// Désactiver un membre : PR et Pasteur uniquement (EF20)
router.patch(
  "/:id/desactiver",
  authenticate,
  requireRole("PR", "PASTEUR"),
  membreController.desactiver
);
export default router;