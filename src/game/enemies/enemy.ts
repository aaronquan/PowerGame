import { DisplayPhysicsSprite } from "../graphics/sprites";
import { Projectile, ProjectileManager } from "../projectiles/projectile";
import { Critter } from "./critter";
import * as Death from "./death";

export class Enemy extends DisplayPhysicsSprite{
  health: number;

  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    this.health = 30;
  }

  take_damage(damage:number):boolean{
    this.health -= damage;
    if(this.health < 0){
      this.destroy();
      return true;
    }
    return false;
  }
}