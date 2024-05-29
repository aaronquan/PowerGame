

export type HitEffect = {
  destroy: boolean
}

export type ProjectileCritterHitEffect = {
  destroy_critter?:boolean;
  destroy_projectile?: boolean;
  capture?:boolean;
}