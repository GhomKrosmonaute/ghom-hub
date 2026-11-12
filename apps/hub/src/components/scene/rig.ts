/**
 * État partagé de la scène, écrit par CameraRig et lu par les autres objets
 * dans leurs useFrame (pas de re-render React).
 */
export const rig = {
  /** scroll lissé 0..1 */
  scroll: 0,
  /** vitesse de scroll lissée (unités de page / s) */
  velocity: 0,
  /** impulsion de glitch 0..1, décroît seule */
  shock: 0,
  /** Musique du lecteur (0..1, lissée) : basses, médiums, aigus et impulsion de kick adoucie. */
  bass: 0,
  mid: 0,
  high: 0,
  kick: 0,
  /** Activité de la basse (coups récents, décroît en quelques secondes) : plus elle est haute, plus on calme. */
  busy: 0,
  /** Moyenne lente de la vraie basse : référence pour isoler les coups. */
  bassAvg: 0,
  /** Impact d'un coup de basse (attaque immédiate, relâche rapide), 0..~1.4 : c'est lui qui « frappe ». */
  punch: 0,
  /** Impulsions médium (caisse claire, accents) et aiguë (charleston), 0..1, retombent seules. */
  snare: 0,
  tick: 0,
  /** Horloge musicale : avance plus vite quand les basses cognent. Remplace elapsedTime pour les défilements. */
  time: 0,
};
