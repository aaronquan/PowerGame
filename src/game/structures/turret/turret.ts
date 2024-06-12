import { DisplaySprite } from "../../graphics/sprites";
import { StructureTile } from "../map/structuretiles";
import * as Critter from "./../../enemies/critter";
import * as Projectile from "./../../projectiles/projectile";
import * as Player from "./../../player/player";
import * as Power from "../power/power";

import * as Sprites from "./../../graphics/sprites";
import * as Positions from "../../entity/positions";

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

  ready: boolean;
  timed_shooting: boolean;
  damage_dealt: number;

  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx,  gy, 'circle32');
    this.power_bar = power;
    this.power = false;
    this.power_consumption = 0;
    this.ready = true;
    this.timed_shooting = true;
  }
  move_direction(point: Phaser.Math.Vector2){

  }
  shoot(proj_manager:Projectile.ProjectileManager): boolean{
    if(this.power){
      const can_shoot = this.power_bar.has_power(this.power_consumption);
      if(can_shoot){
        const has_shot = this.shoot_proj(proj_manager);
        if(has_shot){
          if(this.timed_shooting) this.ready = false;
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

export class LookPositionTurret extends TurretBase{
  range: number;
  range_sq: number;
  look_angle: number;
  target: Phaser.Math.Vector2 | undefined;
  cannon: DisplaySprite | undefined;
  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx, gy, power);
    this.look_angle = 0;
    this.cannon = undefined;
    this.target = undefined;
  }
  set_default_cannon(){
    this.cannon = new DisplaySprite(this.scene, this.x, this.y, 'turret_cannon');
  }
  set_range(r:number){
    this.range = r;
    this.range_sq = r*r;
  }
  move_direction(point: Phaser.Math.Vector2){
    this.target = point;
    const vec = new Phaser.Math.Vector2(point.x - this.x, point.y - this.y);
    const angle = vec.angle();
    this.cannon?.setRotation(angle+Math.PI/2);
  }
  on_target_exit(): void {

  }
  aim_closest_critter(critter_collection:Critter.CritterCollection){
    let dist = this.range_sq;
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
      this.on_target_exit();
    }
  }
}

export class LookGameObjectTurret extends TurretBase{
  range: number;
  range_sq: number;
  look_angle: number;
  target: Sprites.DisplayObject | undefined;
  cannon: DisplaySprite | undefined;
  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx, gy, power);
    this.look_angle = 0;
    this.cannon = undefined;
    this.target = undefined;
  }
  aim_closest_critter(critter_collection:Critter.CritterCollection){
    let dist = this.range_sq;
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
      //const point = new Phaser.Math.Vector2(closest_critter.x, closest_critter.y);
      this.target = closest_critter;
      const vec = new Phaser.Math.Vector2(closest_critter.x - this.x, closest_critter.y - this.y);
      const angle = vec.angle();
      this.cannon?.setRotation(angle+Math.PI/2);
    }else{
      this.target = undefined;
      //this.on_target_exit();
    }
  }
}

export class BallProjectileTurret extends LookPositionTurret{
  interval: number;

  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx, gy, power);
    this.set_range(350);
    this.interval = 1000;
    this.power_consumption = 2;
    this.set_default_cannon();
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
}

export class TazerTurret extends LookGameObjectTurret{
  hit_circle: Phaser.Geom.Circle;
  //tazer_graphics: Phaser.GameObjects.Graphics;
  projectile_id: number | undefined; // use projectile instead todo
  projectile: Projectile.StoredProjectile | undefined; //
  shooting: boolean;
  constructor(scene:Phaser.Scene, gx: number, gy:number, power: Power.PowerBar){
    super(scene, gx, gy, power);
    this.cannon = new DisplaySprite(this.scene, this.x, this.y, "turret_tazer_spout");
    this.range = 150;
    this.range_sq = this.range*this.range;
    this.power_consumption = 0.05;
    this.hit_circle = new Phaser.Geom.Circle(this.x, this.y, this.range);
    this.projectile_id = undefined;
    this.projectile = undefined;
    this.shooting = false;
    this.timed_shooting = false;
  }
  shoot_proj(proj_manager:Projectile.ProjectileManager): boolean{
    if(this.target && !this.shooting){
      const proj = new Projectile.TazerProjectileCircle(this.scene, this.x, this.y, this.range);
      proj.set_target(this.target);
      proj.update_hit_graphics();
      this.projectile_id = proj_manager.add_projectile(proj);
      this.shooting = true;
    }else if(this.shooting && !this.target){
      if(this.projectile_id !== undefined){
        proj_manager.delete_projectile(this.projectile_id);
        this.projectile_id = undefined;
      }
      this.shooting = false;
    }
    if(this.projectile_id !== undefined){
      const proj = proj_manager.projectiles.get(this.projectile_id) as Projectile.TazerProjectileCircle;
      proj.update_hit_graphics();
    }
    return this.shooting;
  }
  on_target_exit(): void {
    //this.shooting = false;
  }
}

export class ShockLandTurret extends TurretBase{
  
}