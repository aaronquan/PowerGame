import * as Projectile from "../projectiles/projectile";
import { Enemy } from "./enemy";
import * as Death from "./death";
import * as StructureTiles from "./../structures/map/structuretiles";
import * as Effects from "./../entity/effects";

export enum CritterType {
  Blue
}

export class CritterCollection{
  critters: Map<number, Critter>;
  next_id: number;
  constructor(){
    this.critters = new Map();
    this.next_id = 0;
  }
  spawn(scene: Phaser.Scene, point: Phaser.Math.Vector2, type: CritterType){
    let critter: Critter | undefined = undefined;
    switch(type){
      case CritterType.Blue:
        critter = new BlueCritter(scene, point.x, point.y);
    }
    if(critter){
      this.add_critter(critter);
    }
  }
  add_critter(critter:Critter):number{
    const id = this.next_id;
    this.critters.set(this.next_id, critter);
    critter.setData('id', id);
    this.next_id += 1;
    return id;
  }
  collision_structure_tile(tile: StructureTiles.StructureTile){
    for(const [id, critter] of this.critters){
      if(critter.rect_collision(tile.getBounds())){
        const hit_effect = critter.on_structure_collision(tile);
        if(hit_effect.destroy){
          this.remove_critter(id);
        }
      }
    }
  }
  player_hit_enemy_test(projectiles:Projectile.ProjectileManager){
    for(const [id, critter] of this.critters){
      for(const [proj_id, proj] of projectiles.projectiles){
        if(proj.critter_collision(critter)){
          const effect = critter.handle_projectile_hit_effect(proj);
          if(effect.destroy){
            this.remove_critter(id);
          }
          const proj_effect = proj.on_hit();
          if(proj_effect.destroy){
            projectiles.delete_projectile(proj_id);
          }
        }
      }
    }
  }
  remove_critter(index: number){
    this.critters.get(index)?.destroy();
    this.critters.delete(index);
  }
  remove_critters(indexs: number[]){
    for(const i of indexs){
      this.remove_critter(i);
    }
  }
  enemy_hit_player_test(){

  }
  set_target(target: Phaser.Math.Vector2){
    for(const [id, critter] of this.critters){
      critter.move_to_target(target);
    }
  }
  update(){
    for(const [id, critter] of this.critters){
      critter.update();
    }
  }
}

export class Critter extends Enemy{
  damage: number;
  speed: number;
  collision_area: Phaser.Geom.Circle;
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);
    this.speed = 10;
    this.damage = 1;
  }
  on_structure_collision(tile: StructureTiles.StructureTile): Effects.HitEffect {
    const tile_id = tile.get_id();
    switch(tile_id){
      case StructureTiles.StructureType.Generator:
        
        break;
    }
    return {destroy: true};
  }
  get_collision_area(): Phaser.Geom.Circle{
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);
    return this.collision_area;
  }
  circle_collision(circle: Phaser.Geom.Circle){
    return Phaser.Geom.Intersects.CircleToCircle(this.collision_area, circle);
  }
  rect_collision(rect: Phaser.Geom.Rectangle){
    return Phaser.Geom.Intersects.CircleToRectangle(this.collision_area, rect);
  }
  draw_collision_area(){
    if(this.collision_area){
      const g = this.scene.add.graphics();
      g.fillStyle(0xff0000, 0.3);
      g.fillCircle(this.collision_area.x, this.collision_area.y, this.collision_area.radius);
    }
  }
  move_to_target(target: Phaser.Math.Vector2){
    const vec = new Phaser.Math.Vector2(target.x-this.x, target.y-this.x);
    vec.normalize();
    vec.scale(this.speed);
    this.setVelocity(vec.x, vec.y);
  }
  
  update(){
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);
  }
  get_position(): Phaser.Math.Vector2{
    return new Phaser.Math.Vector2(this.x, this.y);
  }
  handle_projectile_hit_effect(proj:Projectile.Projectile):Death.EnemyDeathEffect{
    switch(proj.get_type()){
      case Projectile.ProjectileType.Net:
        proj.destroy();// remove this line!!!!
        return {destroy: true};
      case Projectile.ProjectileType.Tazer:
        //const tazer_proj = proj as TazerProjectile;
        this.take_damage(proj.damage);
        proj.update_hit_graphics(this.get_position());
        console.log('tazer hit');
        const destroy = this.take_damage(proj.damage);
        return {destroy: destroy};
      case Projectile.ProjectileType.Ball:
        proj.destroy();
        return {destroy: this.take_damage(proj.damage)};
    }
    return {destroy: false};
  }
  move(x:number, y:number){
    this.setX(this.x+x);
    this.setY(this.y+y);
  }
}
export class BlueCritter extends Critter{
  constructor(scene: Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'blue');
  }
}

export class TestEnemy extends Enemy{
  collision_area: Phaser.Geom.Circle;
  constructor(scene: Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'star');
  }
  get_collision_area(): Phaser.Geom.Circle{
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);
    return this.collision_area;
  }
  draw_collision_area(){
    const g = this.scene.add.graphics();
    g.fillStyle(0xff0000, 0.3);
    g.fillCircle(this.collision_area.x, this.collision_area.y, this.collision_area.radius);
  }
  collision(tri: Phaser.Geom.Triangle){
    //console.log(this.body);
    return Phaser.Geom.Intersects.TriangleToCircle(tri, this.collision_area);
  }
  update(){

  }
}

export class BaseCritter extends Critter{

}