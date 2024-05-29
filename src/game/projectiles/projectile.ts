import { Critter } from "../enemies/critter";
import { DisplayPhysicsSprite } from "../graphics/sprites";
import * as Line from "../graphics/lines";

type ProjectileHitEffect = {
  destroy: boolean
}

export enum ProjectileType {
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
    proj.setData('id', id);
    this.next_id++; 
    return id;
  }
  delete_projectile(key:number){
    const proj = this.projectiles.get(key);
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
      if(!proj.rect_collision(bounds)){
        this.delete_projectile(id);
      }
    }
  }
  test_wall(walls: Phaser.Geom.Rectangle[]){
    for(const [id, proj] of this.projectiles.entries()){
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
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    this.damage = 0;
  }
  on_hit() : ProjectileHitEffect{
    return {destroy: false};
  }
  update_hit_graphics(target:Phaser.Math.Vector2){

  }
  update_collision_area(){

  }
  rect_collision(rect:Phaser.Geom.Rectangle):boolean{
    return false;
  }
  critter_collision(critter:Critter):boolean{
    return false;
  }
  get_type():ProjectileType{
    return ProjectileType.Default;
  }
}

export class MovingProjectile extends Projectile{
  speed: number;
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);

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
  get_type():ProjectileType{
    return ProjectileType.Net;
  }
}

//stationary
export class TazerProjectile extends Projectile{
  collision_area: Phaser.Geom.Triangle;
  taze_effect: Phaser.GameObjects.Graphics;
  is_hitting:boolean;
  start_point: Phaser.Math.Vector2;
  constructor(scene: Phaser.Scene, triangle: Phaser.Geom.Triangle){
    super(scene, 0, 0, 'nothing');
    this.collision_area = triangle;
    this.damage = 0.05;
    this.is_hitting = false;
  }
  update_tazer_collision_area(new_area: Phaser.Geom.Triangle): void {
    this.collision_area = new_area;
  }
  critter_collision(critter: Critter): boolean {
    return Phaser.Geom.Intersects.TriangleToCircle(this.collision_area, critter.collision_area);
  }
  get_type():ProjectileType{
    return ProjectileType.Tazer;
  }

  get_effect_end_point(angle:number, start_point: Phaser.Math.Vector2):Phaser.Math.Vector2{
    const vec = new Phaser.Math.Vector2(35, 0);
    vec.rotate(angle-Math.PI/2);
    const p = new Phaser.Math.Vector2(start_point.x+vec.x, start_point.y+vec.y);
    return p;
  }
  update_taze_graphics(angle:number, start_point: Phaser.Math.Vector2){
    if(start_point) this.start_point = start_point;
    if(this.is_hitting) return;
    this.taze_effect?.destroy();
    const end_point = this.get_effect_end_point(angle, start_point);
    const new_line = new Line.RandomLinePath(start_point, end_point, 10, 4);
    const path = new_line.generate_path();
    this.taze_effect = Line.drawCurvePath(this.scene, path, 0x0055d1, 1, 0.7);
  }
  update_hit_graphics(target: Phaser.Math.Vector2){
    this.taze_effect?.destroy();
    const end_point = target;
    const new_line = new Line.RandomLinePath(this.start_point!, end_point, 12, 4);
    const path = new_line.generate_path();
    this.taze_effect = Line.drawCurvePath(this.scene, path, 0x0055d1, 2, 1);
  }
  hit_taze_effect(){

  }
  rect_collision(rect: Phaser.Geom.Rectangle): boolean {
    return Phaser.Geom.Intersects.RectangleToTriangle(rect, this.collision_area);
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
  get_type():ProjectileType{
    return ProjectileType.Ball;
  }
  on_hit() : ProjectileHitEffect{
    return {destroy: true};
  }
}