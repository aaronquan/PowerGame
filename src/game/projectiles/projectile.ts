import { Critter } from "../enemies/critter";
import { DisplayPhysicsSprite } from "../graphics/sprites";
import * as Line from "../graphics/lines";
import * as Positions from "../entity/positions";
import * as Sprites from "./../graphics/sprites"

type ProjectileHitEffect = {
  destroy: boolean
}

export type StoredProjectile = {
  id: number;
  projectile: Projectile;
}

export enum ProjectileType {
  Moving, // like a bullet
  Direct, //has a target and is unavoidable
  Area,
}

export enum ProjectileId {
  Default, Tazer, Net, Ball
}

export class ProjectileManager{
  projectiles: Map<number, Projectile>;
  next_id: number;
  constructor(){
    this.projectiles = new Map();
    this.next_id = 0;
  }
  add_projectile(proj: Projectile):number{
    this.projectiles.set(this.next_id, proj);
    const id = this.next_id;
    proj.setData('projectile_id', id);
    this.next_id++; 
    return id;
  }
  delete_projectile(key:number){
    const proj = this.projectiles.get(key);
    //console.log(proj);
    proj?.destroy();
    this.projectiles.delete(key);
  }
  as_array(): Projectile[]{
    return [...this.projectiles.values()];
  }
  update(){
    for(const proj of this.projectiles.values()){
      proj.update_collision_area();
    }
  }
  cull_out_of_bounds(bounds: Phaser.Geom.Rectangle){
    for(const [id, proj] of this.projectiles.entries()){
      if(proj.get_id() === ProjectileId.Tazer){
        continue;
      }
      if(!proj.rect_collision(bounds)){
        this.delete_projectile(id);
      }
    }
  }
  test_wall(walls: Phaser.Geom.Rectangle[]){
    for(const [id, proj] of this.projectiles.entries()){
      if(proj.get_id() === ProjectileId.Tazer){
        continue;
      }
      for(const wall of walls){
        const collision = proj.rect_collision(wall);
        if(collision){
          this.delete_projectile(id);
        }
      }
    }
  }
}

export class Projectile extends DisplayPhysicsSprite{
  damage: number;
  solid: boolean;
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    this.damage = 0;
    this.solid = false;
  }
  on_hit() : ProjectileHitEffect{
    return {destroy: false};
  }
  update_hit_graphics(){

  }
  update_collision_area(){

  }
  get_target(): Phaser.GameObjects.GameObject | undefined{
    return undefined;
  }
  rect_collision(rect:Phaser.Geom.Rectangle):boolean{
    return false;
  }
  critter_collision(critter:Critter):boolean{
    return false;
  }
  get_id():ProjectileId{
    return ProjectileId.Default;
  }
}

export class MovingProjectile extends Projectile{
  speed: number;
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    this.solid = true;
  }
  set_target(angle:number, target: Phaser.Math.Vector2){
    const vector = new Phaser.Math.Vector2(target.x-this.x, target.y-this.y);
    vector.normalize();
    vector.scale(this.speed);
    this.setRotation(angle);
    this.setVelocity(vector.x, vector.y);
  }
  update_collision_area(){

  }
}

export class NetProjectile extends MovingProjectile{
  collision_area: Phaser.Geom.Circle;
  speed: number;
  lifetime: number;
  constructor(scene: Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'net');
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);

    this.lifetime = 2000;
    this.speed = 100;
    this.damage = 5;

  }
  on_hit(): ProjectileHitEffect{
    return {destroy: true};
  }
  critter_collision(critter:Critter):boolean{
    //console.log(this.collision_area);
    return Phaser.Geom.Intersects.CircleToCircle(critter.collision_area, this.collision_area);
  }
  update_collision_area(){
    //this.setRotation(this.body!.velocity.angle());
    this.collision_area.setPosition(this.x, this.y);
  }
  start_destroy_event(projectile_manager:ProjectileManager, id: number){
    this.scene.time.addEvent({delay: this.lifetime, callback: () => {
      projectile_manager.delete_projectile(id);
      this.destroy();
    }});
  }
  rect_collision(rect: Phaser.Geom.Rectangle): boolean {
    return Phaser.Geom.Intersects.CircleToRectangle(this.collision_area, rect);
  }
  get_id():ProjectileId{
    return ProjectileId.Net;
  }
}

export class DirectProjectile extends Projectile{
  //max_targets: number
  target: Sprites.DisplayObject | undefined;
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    //this.max_targets = 1;
    this.target = undefined;
  }
  set_closest_target(potential_targets: Sprites.DisplayObject[]){
    this.target = Positions.closestEntityToEntity(this, potential_targets)?.entity;
  }
  set_target(target: Sprites.DisplayObject | undefined){
    this.target = target;
  }
  get_target(): Sprites.DisplayObject | undefined{
    return this.target;
  }

}

//stationary
export class TazerProjectileGeneral extends DirectProjectile{
  taze_effect: Phaser.GameObjects.Graphics;
  is_hitting:boolean;
  constructor(scene: Phaser.Scene, x: number=0, y: number=0){
    super(scene, x, y, 'nothing');
    this.damage = 0.05;
    this.is_hitting = false;
  }

  get_id():ProjectileId{
    return ProjectileId.Tazer;
  }
  get_effect_end_point(angle:number, start_point: Phaser.Math.Vector2):Phaser.Math.Vector2{
    const vec = new Phaser.Math.Vector2(35, 0);
    vec.rotate(angle-Math.PI/2);
    const p = new Phaser.Math.Vector2(start_point.x+vec.x, start_point.y+vec.y);
    return p;
  }
  update_taze_graphics(angle:number, start_point: Phaser.Math.Vector2){
    this.x = start_point.x; this.y = start_point.y;
    if(this.is_hitting) return;
    this.taze_effect?.destroy();
    const end_point = this.get_effect_end_point(angle, start_point);
    const new_line = new Line.RandomLinePath(start_point, end_point, 10, 4);
    const path = new_line.generate_path();
    this.taze_effect = Line.drawCurvePath(this.scene, path, 0x0055d1, 1, 0.7);
  }
  get_start_point(){
    return new Phaser.Math.Vector2(this.x, this.y);
  }
  update_hit_graphics(){
    //console.log(this.target);
    if(this.target && this.target.body){
      const start = this.get_start_point();
      this.taze_effect?.destroy();
      //const entity = this.target.
      const end_point = new Phaser.Math.Vector2(this.target.x, this.target.y);
      const new_line = new Line.RandomLinePath(start, end_point, 12, 4);
      const path = new_line.generate_path();
      this.taze_effect = Line.drawCurvePath(this.scene, path, 0x0055d1, 2, 1);
    }
  }
  rect_collision(rect: Phaser.Geom.Rectangle): boolean {
    return false;
  }
  destroy(){
    super.destroy();
    this.taze_effect?.destroy();
  }
}

export class TazerProjectileTriangle extends TazerProjectileGeneral{
  collision_area: Phaser.Geom.Triangle;
  constructor(scene: Phaser.Scene, triangle: Phaser.Geom.Triangle){
    super(scene);
    this.collision_area = triangle;
  } 
  update_tazer_collision_area(new_area: Phaser.Geom.Triangle): void {
    this.collision_area = new_area;
  }
  critter_collision(critter: Critter): boolean {
    return Phaser.Geom.Intersects.TriangleToCircle(this.collision_area, critter.collision_area);
  }
}

export class TazerProjectileCircle extends TazerProjectileGeneral{
  collision_area: Phaser.Geom.Circle;
  constructor(scene: Phaser.Scene, x:number, y: number, radius: number){
    super(scene, x, y);
    this.collision_area = new Phaser.Geom.Circle(x, y, radius);
  } 
  update_tazer_collision_area(new_area: Phaser.Geom.Circle): void {
    this.collision_area = new_area;
  }
  critter_collision(critter: Critter): boolean {
    return Phaser.Geom.Intersects.CircleToCircle(this.collision_area, critter.collision_area);
  }
  rect_collision(rect: Phaser.Geom.Rectangle): boolean {
    return Phaser.Geom.Intersects.CircleToRectangle(this.collision_area, rect);
  }
}


export class BallProjectile extends MovingProjectile{
  collision_area: Phaser.Geom.Circle;
  
  constructor(scene: Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'circle6');
    this.collision_area = new Phaser.Geom.Circle(this.x, this.y, this.width/2);
    this.speed = 200;
    this.damage = 5;
  }
  critter_collision(critter:Critter):boolean{
    return Phaser.Geom.Intersects.CircleToCircle(critter.collision_area, this.collision_area);
  }
  update_collision_area(){
    this.collision_area.setPosition(this.x, this.y);
  }
  rect_collision(rect: Phaser.Geom.Rectangle): boolean {
    return Phaser.Geom.Intersects.CircleToRectangle(this.collision_area, rect);
  }
  get_id():ProjectileId{
    return ProjectileId.Ball;
  }
  on_hit() : ProjectileHitEffect{
    return {destroy: true};
  }
}