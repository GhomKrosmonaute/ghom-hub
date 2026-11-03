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
};
