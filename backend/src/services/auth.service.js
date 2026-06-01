import { supabase } from "../config/supabase.js";
import { verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
export async function login({ identifiant, password }) {
  // L'identifiant peut être un email OU un téléphone (EF02)
  const { data: user, error } = await supabase
    .from("users")
    .select(`
      id, nom, prenom, email, telephone, password_hash, is_active, departement_id,
      role:roles ( code, libelle, niveau )
    `)
    .or(`email.eq.${identifiant},telephone.eq.${identifiant}`)
    .maybeSingle();

  if (error) throw error;
  if (!user) {
    const err = new Error("Identifiants invalides");
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error("Votre compte est désactivé. Contactez l'administrateur.");
    err.status = 403;
    throw err;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    const err = new Error("Identifiants invalides");
    err.status = 401;
    throw err;
  }

  // Payload minimal dans le token — on ne stocke JAMAIS le password_hash
  const tokenPayload = {
    sub: user.id,
    role: user.role.code,
    departement_id: user.departement_id,
  };

  return {
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken({ sub: user.id }),
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      departement_id: user.departement_id,
    },
  };
}
export async function getMe(userId) {
  const { data: user, error } = await supabase
    .from("users")
    .select(`
      id, nom, prenom, email, telephone, is_active, departement_id,
      role:roles ( code, libelle, niveau )
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!user) {
    const err = new Error("Utilisateur introuvable");
    err.status = 404;
    throw err;
  }

  return user;
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    const err = new Error("Refresh token manquant");
    err.status = 401;
    throw err;
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error("Refresh token invalide ou expiré");
    err.status = 401;
    throw err;
  }

  // On recharge l'utilisateur pour avoir des infos à jour
  // (son rôle ou son département a pu changer depuis l'émission du token)
  const { data: user, error } = await supabase
    .from("users")
    .select(`id, is_active, departement_id, role:roles ( code )`)
    .eq("id", payload.sub)
    .maybeSingle();

  if (error) throw error;
  if (!user || !user.is_active) {
    const err = new Error("Compte introuvable ou désactivé");
    err.status = 403;
    throw err;
  }

  const tokenPayload = {
    sub: user.id,
    role: user.role.code,
    departement_id: user.departement_id,
  };

  return {
    accessToken: signAccessToken(tokenPayload),
  };
}