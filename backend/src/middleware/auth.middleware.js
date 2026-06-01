import { verifyAccessToken } from "../utils/jwt.js";

// Vérifie que la requête porte un token JWT valide.
// Si oui, attache les infos user à req.user et laisse passer.
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      departement_id: payload.departement_id,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

// Restreint l'accès à une liste de rôles autorisés.
// À utiliser TOUJOURS après authenticate (qui pose req.user).
export function requireRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    if (!rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({
        error: "Accès refusé : vous n'avez pas les droits nécessaires",
      });
    }

    next();
  };
}