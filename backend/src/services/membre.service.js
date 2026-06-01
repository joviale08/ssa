import { supabase } from "../config/supabase.js";

export async function createMembre(data) {
  const { data: membre, error } = await supabase
    .from("membres")
    .insert(data)
    .select(`
      id, nom, prenom, telephone, telephone_remarque, email,
      date_naissance, sexe, adresse, zone_residence,
      departement_id, encadreur_id, statut, date_integration, is_active
    `)
    .single();

  if (error) throw error;
  return membre;
}

// Liste les membres selon le périmètre de l'utilisateur connecté.
// Le filtre dépend du rôle — décidé côté serveur, jamais par le client.
export async function listMembres(user) {
  let query = supabase
    .from("membres")
    .select(`
      id, nom, prenom, telephone, telephone_remarque, email,
      sexe, zone_residence, departement_id, encadreur_id,
      statut, date_integration, is_active
    `)
    .eq("is_active", true)
    .order("nom", { ascending: true });

  // Application du périmètre selon le rôle
  switch (user.role) {
    case "PASTEUR":
    case "PR":
      // Aucun filtre : ils voient tout
      break;

    case "LEADER":
      // Uniquement son département
      query = query.eq("departement_id", user.departement_id);
      break;

    case "ENCADREUR":
      // Uniquement ses propres membres
      query = query.eq("encadreur_id", user.id);
      break;

    default:
      // Tout autre rôle : aucun accès
      return [];
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Récupère un membre par son id, en vérifiant que l'utilisateur
// a le droit de le voir (selon son périmètre).
export async function getMembreById(id, user) {
  const { data: membre, error } = await supabase
    .from("membres")
    .select(`
      id, nom, prenom, telephone, telephone_remarque, email,
      date_naissance, sexe, adresse, zone_residence,
      departement_id, encadreur_id, statut, date_integration, is_active
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!membre) {
    const err = new Error("Membre introuvable");
    err.status = 404;
    throw err;
  }

  // Vérification du périmètre : l'utilisateur a-t-il le droit de voir CE membre ?
  const autorise = peutVoirMembre(membre, user);
  if (!autorise) {
    const err = new Error("Accès refusé à ce membre");
    err.status = 403;
    throw err;
  }

  return membre;
}

// Règle de visibilité d'un membre selon le rôle (Annexe D du CDC)
function peutVoirMembre(membre, user) {
  switch (user.role) {
    case "PASTEUR":
    case "PR":
      return true;  // voient tout
    case "LEADER":
      return membre.departement_id === user.departement_id;
    case "ENCADREUR":
      return membre.encadreur_id === user.id;
    default:
      return false;
  }
}
// Modifie un membre, après vérification du périmètre.
export async function updateMembre(id, data, user) {
  // On réutilise getMembreById : il vérifie l'existence ET le périmètre.
  // S'il lève une erreur (404 ou 403), elle remonte telle quelle.
  await getMembreById(id, user);

  const { data: membre, error } = await supabase
    .from("membres")
    .update(data)
    .eq("id", id)
    .select(`
      id, nom, prenom, telephone, telephone_remarque, email,
      date_naissance, sexe, adresse, zone_residence,
      departement_id, encadreur_id, statut, date_integration, is_active
    `)
    .single();

  if (error) throw error;
  return membre;
}
// Désactive un membre (soft delete) — on ne supprime jamais (EF20).
export async function desactiverMembre(id, user) {
  // Vérifie existence + périmètre, comme pour update
  await getMembreById(id, user);

  const { data: membre, error } = await supabase
    .from("membres")
    .update({ is_active: false, statut: "Inactif" })
    .eq("id", id)
    .select(`id, nom, prenom, statut, is_active`)
    .single();

  if (error) throw error;
  return membre;
}