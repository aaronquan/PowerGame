import * as Sprites from "../graphics/sprites";


export class LivingMovingEntity extends Sprites.DisplayPhysicsSprite{
  health: number;
  show_health_bar: boolean;
  health_bar: HealthBar;
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    this.health = 10;
    this.show_health_bar = false;
    this.health_bar = new HealthBar();
  }
}

//for structures
export class StaticDestroyableEntity extends Sprites.DisplaySprite{

}

class HealthBar{
  background: Phaser.GameObjects.Graphics;
}