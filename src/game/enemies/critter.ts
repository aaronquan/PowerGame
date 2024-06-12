import * as Projectile from "../projectiles/projectile";
import { Enemy } from "./enemy";
import * as StructureTiles from "./../structures/map/structuretiles";
import * as Effects from "./../entity/effects";
import * as Player from "./../player/player";
import * as Positions from "./../entity/positions";

import * as Entity from "./../entity/entity";
import * as Sprites from "../graphics/sprites";
import * as Critters from "../entity/inventory/critters";


export type StoredCritter = {
  id:number;
  critter: Critter;
}

export enum CritterType {
  Blue
}

export class CritterCollection{
  critters: Map<number, Critter>;
  next_id: number;

  // health bars as a global
  health_bars_shown:boolean;

  constructor(){
    this.critters = new Map();
    this.next_id = 0;
    this.health_bars_shown = false;
  }
  spawn(scene: Phaser.Scene, point: Phaser.Math.Vector2, type: CritterType){
    let critter: Critter | undefined = undefined;
    switch(type){
      case CritterType.Blue:
        critter = new BlueCritter(scene, point.x, point.y);
    }
    if(critter){
      if(this.health_bars_shown){
        critter.display_health_bar();
      }else{
        critter.hide_health_bar();
      }
      this.add_critter(critter);
    }
  }
  add_critter(critter:Critter):number{
    const id = this.next_id;
    this.critters.set(this.next_id, critter);
    critter.setData('critter_id', id);
    const entity_id:Entity.GameObjectIdentifier = {type: Entity.EntityType.Critter, id: id};
    critter.setData('entity_id', entity_id);
    this.next_id += 1;
    return id;
  }

  point_hit(point: Phaser.Math.Vector2): Critter[]{
    const critters: Critter[] = [];
    for(const [id, critter] of this.critters){
      if(critter.point_collision(point)){
        critters.push(critter);
      }
    }
    return critters;
  }
  collision_structure_tile(tile: StructureTiles.StructureTile){
    for(const [id, critter] of this.critters){
      if(critter.rect_collision(tile.getBounds())){
        const hit_effect = critter.on_structure_collision(tile);
        if(hit_effect.destroy){
          console.log("hit gen")
          this.remove_critter(id);
        }
      }
    }
  }
  player_hit_enemy_test(player: Player.Player, projectiles:Projectile.ProjectileManager){
    for(const [proj_id, proj] of projectiles.projectiles){
      if(proj.get_id() === Projectile.ProjectileId.Tazer){
        const target = proj.get_target();
        const object_identifier:Entity.GameObjectIdentifier | undefined = target?.getData('entity_id');
        if(object_identifier == undefined) continue;
        console.log(object_identifier);
        const critter = this.critters.get(object_identifier.id);
        if(critter){
          const effect:Effects.ProjectileCritterHitEffect = critter.handle_projectile_hit_effect(proj);
          this.run_effect(effect, player, projectiles, proj_id, critter, object_identifier.id);
        }
      }else{
        for(const [critter_id, critter] of this.critters){
          if(proj.critter_collision(critter)){
            const effect:Effects.ProjectileCritterHitEffect = critter.handle_projectile_hit_effect(proj);
            this.run_effect(effect, player, projectiles, proj_id, critter, critter_id);
          }
        }
      }
    }
  }
  run_effect(effect:Effects.ProjectileCritterHitEffect, player: Player.Player, projectiles:Projectile.ProjectileManager,
    projectile_id:number, critter: Critter, critter_id: number)
  {
    if(effect.capture){
      const new_inv_critter = critter.get_inventory();
      player.inventory.add_entity(new_inv_critter);
    }
    if(effect.destroy_critter){
      this.remove_critter(critter_id);
    }
    if(effect.destroy_projectile){
      projectiles.delete_projectile(projectile_id);
    }
  }
  remove_critter(index: number){
    this.critters.get(index)?.die();
    this.critters.delete(index);
  }
  remove_critters(indexs: number[]){
    for(const i of indexs){
      this.remove_critter(i);
    }
  }
  enemy_hit_player_test(player:Player.Player){

  }
  set_closest_target(targets: Phaser.Math.Vector2[]){
    for(const [id, critter] of this.critters){
      const distPoint = Positions.closestEntityToPoints(critter, targets);
      if(distPoint) critter.move_to_target(distPoint.point);
    }
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
  toggle_health_bars(){
    this.health_bars_shown = !this.health_bars_shown;
    if(this.health_bars_shown){
      this.show_health_bars();
    }else{
      this.hide_health_bars();
    }
  }
  show_health_bars(){
    for(const [id, critter] of this.critters){
      critter.display_health_bar();
    }
  }
  hide_health_bars(){
    for(const [id, critter] of this.critters){
      critter.hide_health_bar();
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
        tile.on_critter_collision(this);
        break;
    }
    return {destroy: true};
  }
  get_collision_area(): Phaser.Geom.Circle{
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);
    return this.collision_area;
  }
  point_collision(point: Phaser.Math.Vector2){
    return this.collision_area.contains(point.x, point.y);
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
    const vec = new Phaser.Math.Vector2(target.x-this.x, target.y-this.y);
    vec.normalize();
    vec.scale(this.speed);
    this.setVelocity(vec.x, vec.y);
  }
  update(){
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);
    this.health_bar.update_position(this.x, this.y);
  }
  get_position(): Phaser.Math.Vector2{
    return new Phaser.Math.Vector2(this.x, this.y);
  }
  handle_projectile_hit_effect(proj:Projectile.Projectile):Effects.ProjectileCritterHitEffect{
    switch(proj.get_id()){
      case Projectile.ProjectileId.Net:
        return {destroy_critter: true, destroy_projectile: true, capture: true};
      case Projectile.ProjectileId.Tazer: 
        this.take_damage(proj.damage);
        //proj.update_hit_graphics();
        const destroy = this.take_damage(proj.damage);
        return {destroy_critter: destroy};
      case Projectile.ProjectileId.Ball:
        proj.destroy();
        return {destroy_critter: this.take_damage(proj.damage), destroy_projectile: true};
    }
    return {capture: false};
  }
  move(x:number, y:number){
    this.setX(this.x+x);
    this.setY(this.y+y);
  }
  get_inventory(): Critters.CritterInventory{
    return Critters.CritterInventory.new_blank();
  }
}
export class BlueCritter extends Critter{
  static texture_name = "blue";
  constructor(scene: Phaser.Scene, x:number, y:number){
    super(scene, x, y, BlueCritter.texture_name);
    this.max_health = 50;
    this.health = 50;
  }
  get_inventory(): Critters.CritterInventory {
    return new Critters.BlueCritterInventory();
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
  collision(tri: Phaser.Geom.Triangle):boolean{
    return Phaser.Geom.Intersects.TriangleToCircle(tri, this.collision_area);
  }
  update(){

  }
}

export class BaseCritter extends Critter{

}