import { DisplaySprite } from "../../graphics/sprites";
import { StructureTile } from "../map/structuretiles";
import * as Critter from "./../../enemies/critter";
import * as Projectile from "./../../projectiles/projectile";
import * as Player from "./../../player/player";
import * as Power from "../power/power";

export class TurretManager{
  turrets: Map<number, TurretBase>;
  next_id: number;
  constructor(){
    this.turrets = new Map();
    this.next_id = 0;
  }
  add_turret(turret:TurretBase): number{
    this.turrets.set(this.next_id, turret)
    const id = this.next_id;
    this.next_id += 1;
    return id;
  }
  remove_turret(id: number): boolean{
    if(this.turrets.has(id)){
      this.turrets.get(id)!.destroy();
      this.turrets.delete(id);
      return true;
    }
    return false;
  }
  update_power(proj_manager:Projectile.ProjectileManager){
    for(const [id, turret] of this.turrets){
      turret.on_power_up(proj_manager);
    }
  }
  update_turret_shooting(proj_manager:Projectile.ProjectileManager){
    for(const [id, turret] of this.turrets){
      if(turret.ready){
        turret.shoot(proj_manager);
      }
    }
  }
  update_aim_turrets(critters: Critter.CritterCollection){
    for(const [id, turret] of this.turrets){
      //if(turret.ready){
        turret.aim_closest_critter(critters);
      //}
    }
  }
}

export class TurretBase extends StructureTile{
  //power: boolean
  power_bar: Power.PowerBar;
  power_consumption: number;
  ready: boolean
  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx,  gy, 'circle32');
    this.power_bar = power;
    this.power = false;
    this.power_consumption = 0;
    this.ready = true;
  }
  move_direction(point: Phaser.Math.Vector2){

  }
  shoot(proj_manager:Projectile.ProjectileManager): boolean{
    if(this.power){
      const can_shoot = this.power_bar.has_power(this.power_consumption);
      if(can_shoot){
        const has_shot = this.shoot_proj(proj_manager);
        if(has_shot){
          this.ready = false
          this.power_bar.spend_power(this.power_consumption);
          return true;
        }
      }
      this.ready = true;
    }
    return false;
  }
  shoot_proj(proj_manager:Projectile.ProjectileManager): boolean{
    return false;
  }
  on_power_up(proj_manager:Projectile.ProjectileManager): void {
    if(this.changed_power){
      this.shoot(proj_manager);
      this.changed_power = false;
    }
  }
  aim_closest_critter(critter_collection:Critter.CritterCollection){
    
  }
}

export class LookDirectionTurret extends TurretBase{
  look_angle: number;
  target: Phaser.Math.Vector2 | undefined;
  cannon: DisplaySprite;
  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx, gy, power);
    this.look_angle = 0;
    this.cannon = new DisplaySprite(scene, this.x, this.y, 'turret_cannon');
    this.target = undefined;
  }
  move_direction(point: Phaser.Math.Vector2){
    this.target = point;
    const vec = new Phaser.Math.Vector2(point.x - this.x, point.y - this.y);
    const angle = vec.angle();
    this.cannon.setRotation(angle+Math.PI/2);
  }

}

export class BallProjectileTurret extends LookDirectionTurret{
  range: number;
  interval: number;

  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx, gy, power);
    this.range = 350;
    this.interval = 1000;
    this.power_consumption = 2;
  }
  shoot_proj(proj_manager:Projectile.ProjectileManager): boolean{
    let shooting = false;
    if(this.target){
      const proj = new Projectile.BallProjectile(this.scene, this.x, this.y);
      proj.set_target(this.look_angle, this.target);
      proj_manager.add_projectile(proj);
      shooting = true;
    }
    this.scene.time.addEvent({delay: this.interval, callback: () => this.shoot(proj_manager)});
    return shooting;
  }
  aim_closest_critter(critter_collection:Critter.CritterCollection){
    let dist = this.range*this.range;
    let closest_critter:Critter.Critter | undefined = undefined;
    for(const [id, c] of critter_collection.critters){
      const vec = new Phaser.Math.Vector2(c.x - this.x, c.y - this.y);
      const len = vec.lengthSq();
      if(vec.lengthSq() < dist){
        dist = len;
        closest_critter = c;
      }
    }
    if(closest_critter){
      const point = new Phaser.Math.Vector2(closest_critter.x, closest_critter.y);
      this.move_direction(point);
    }else{
      this.target = undefined;
    }
  }
}