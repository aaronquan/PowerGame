import { NetProjectile, ProjectileManager } from "../projectiles/projectile";
import { Player} from "./player";
import * as Power from "./../structures/power/power";
import * as Projectile from "../projectiles/projectile";
import * as Line from "../graphics/lines";

export type WeaponAttackEffect = {

}

export enum WeaponTypes {
  None, Default, Tazer, Net, Wire, Ball
}

export class WeaponHolder{
  slots: number;
  current_weapon: number; // index of weapon
  weapons: (Weapon | undefined)[];
  constructor(slots: number){
    this.slots = slots;
    this.weapons = [];
    for(let i = 0; i < this.slots; i++){
      this.weapons.push(undefined);
    }
    this.current_weapon = 0;
  }
  add_weapon(weapon:Weapon){
    if(this.weapons.length > 0){
      weapon.setVisible(false);
    }
    if(this.weapons.length <= this.slots){
      this.weapons.push(weapon);
    }
  }
  swap_weapon(slot: number, weapon:Weapon){
    if(this.current_weapon !== slot){
      weapon.setVisible(false);
    }
    if(slot >= 0 && slot < this.slots){
      this.weapons[slot] = weapon;
    }
  }
  rotate(angle: number, base_position: Phaser.Math.Vector2){
    const current = this.get_current();
    if(current === undefined) return;
    current.rotate_vector(angle, base_position);
    current.setRotation(angle);
  }
  get_current():Weapon | undefined{
    if(this.current_weapon >= this.slots) return undefined;
    return this.weapons[this.current_weapon];
  }
  change(weapon_slot:number, projectile_manager:ProjectileManager){
    this.stop(projectile_manager);
    const current = this.get_current();
    current?.setVisible(false);
    this.current_weapon = weapon_slot;
    const new_weapon = this.get_current();
    new_weapon?.setVisible(true);
  }
  shoot(projectile_manager:ProjectileManager, position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, 
    scene: Phaser.Scene, angle: number, power_bar:Power.PowerBar){
    const current = this.get_current();
    if(current === undefined) return;
    current.attack(projectile_manager, position, target, 
      scene, angle, power_bar);
  }
  stop(projectile_manager:ProjectileManager){
    const current = this.get_current();
    if(current === undefined) return;
    current.stop_shooting(projectile_manager);
  }
  get_current_type(): WeaponTypes{
    const current = this.get_current();
    if(current === undefined) return WeaponTypes.None;
    return current.get_weapon_type();
  }
}

export class Weapon extends Phaser.GameObjects.Sprite{
  relative_position: Phaser.Math.Vector2;
  power_usage: number;
  constructor(scene:Phaser.Scene, rel_x: number,  rel_y: number, player: Player, texture: string){
    super(scene, rel_x+player.x, rel_y+player.y, texture);
    scene.add.existing(this);
    this.relative_position = new Phaser.Math.Vector2(12, -17);
    this.power_usage = 0;
  }
  rotate_vector(angle:number, base_position: Phaser.Math.Vector2){
    const vec = this.relative_position.clone();
    vec.rotate(angle);
    this.setX(vec.x+base_position.x);
    this.setY(vec.y+base_position.y);
  }
  attack(projectile_manager:ProjectileManager, position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, 
    scene: Phaser.Scene, angle: number, power_bar: Power.PowerBar){

  }
  stop_shooting(projectile_manager:ProjectileManager){

  }
  get_weapon_type(): WeaponTypes{
    return WeaponTypes.Default;
  }
  use_power(power_bar: Power.PowerBar) : boolean{
    return power_bar.spend_power(this.power_usage);
  }
}

export class TazerWeapon extends Weapon{
  is_shooting: boolean
  taze_area: Phaser.GameObjects.Graphics; // for testing
  show_taze_area: boolean;
  hit_box: Phaser.Geom.Triangle;
  last_hits: number[]; // hold hits on enemies redo typing
  //damage: number;
  projectile: Projectile.TazerProjectileTriangle | undefined;
  projectile_id: number | undefined;

  //taze_effect: Phaser.GameObjects.Graphics;
  constructor(scene:Phaser.Scene, rel_x: number, rel_y: number, player: Player){
    super(scene, rel_x+player.x, rel_y+player.y, player, 'tazer');
    this.is_shooting = false;


    this.hit_box = new Phaser.Geom.Triangle();
    //this.damage = 0.05;
    this.power_usage = 0.1;
    this.projectile = undefined;
    this.projectile_id = undefined;
    this.show_taze_area = false;
  }
  get_weapon_type(): WeaponTypes{
    return WeaponTypes.Tazer;
  }
  attack(projectile_manager:ProjectileManager, position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, 
    scene: Phaser.Scene, angle: number, power_bar: Power.PowerBar){
    if(this.use_power(power_bar)){
      if(!this.is_shooting){
        this.hit_box = this.get_triangle(angle);
        this.is_shooting = true;
        console.log("new taze");
        const taze_proj = new Projectile.TazerProjectileTriangle(this.scene, this.hit_box);
        const proj_id = projectile_manager.add_projectile(taze_proj);
        this.projectile_id = proj_id;
        this.projectile = taze_proj;
        this.get_area_graphics(this.scene); // visuals
        console.log(this.projectile);
      }else{
        this.hit_box = this.get_triangle(angle);
        //this.projectile?.scene = this.scene;
        this.projectile?.update_tazer_collision_area(this.hit_box);

        //draws area graphics
        this.taze_area?.destroy();
        this.get_area_graphics(this.scene);
      }
      this.projectile?.update_taze_graphics(angle, this.get_position());
    }else{
      this.stop_shooting(projectile_manager);
    }
  }
  get_triangle(angle:number):Phaser.Geom.Triangle{
    const vec1 = new Phaser.Math.Vector2(60, 0);
    const vec2 = new Phaser.Math.Vector2(60, 0);
    const half_angle = Phaser.Math.DegToRad(40);
    vec1.rotate(angle-half_angle-(Math.PI/2));
    vec2.rotate(angle+half_angle-(Math.PI/2));
    const p2 = new Phaser.Geom.Point(this.x+vec1.x,this.y+vec1.y);
    const p3 = new Phaser.Geom.Point(this.x+vec2.x,this.y+vec2.y);
    return new Phaser.Geom.Triangle(this.x, this.y, p2.x, p2.y, p3.x, p3.y);
  }
  get_effect_end_point(angle:number):Phaser.Math.Vector2{
    const vec = new Phaser.Math.Vector2(35, 0);
    vec.rotate(angle-Math.PI/2);
    const p = new Phaser.Math.Vector2(this.x+vec.x, this.y+vec.y);
    return p;
  }
  /*
  update_taze_graphics(scene: Phaser.Scene, angle:number){

    const end_point = this.get_effect_end_point(angle);
    const start_point = new Phaser.Math.Vector2(this.x, this.y);
    const new_line = new Line.RandomLinePath(start_point, end_point, 10, 4);
    const path = new_line.generate_path();
    this.taze_effect = Line.drawCurvePath(scene, path, 0x0000ff, 1);
  }*/
  get_area_graphics(scene: Phaser.Scene){
    if(this.show_taze_area){
      const taze_triangle = scene.add.graphics();
      taze_triangle.fillStyle(0x00ff00, 0.5);
      taze_triangle.beginPath();
      taze_triangle.moveTo(this.hit_box.x1, this.hit_box.y1);
      taze_triangle.lineTo(this.hit_box.x2, this.hit_box.y2);
      taze_triangle.lineTo(this.hit_box.x3, this.hit_box.y3);
      taze_triangle.fillPath();
      this.taze_area = taze_triangle;
    }
  }
  stop_shooting(projectile_manager:ProjectileManager){
    if(this.is_shooting){
      this.is_shooting = false;
      this.taze_area?.destroy();

      this.projectile?.taze_effect.destroy();
      projectile_manager.delete_projectile(this.projectile_id!);
      this.projectile_id = undefined;
      this.projectile = undefined;
      //this.taze_effect?.destroy();
      
    }
  }
  get_position(): Phaser.Math.Vector2{
    return new Phaser.Math.Vector2(this.x, this.y);
  }
}

export class CooldownWeapon extends Weapon{
  cooldown: number;
  ready: boolean;
  constructor(scene:Phaser.Scene, rel_x: number, rel_y: number, player: Player, texture:string){
    super(scene, rel_x+player.x, rel_y+player.y, player, texture);
    this.cooldown = 100;
    this.ready = true;
    this.power_usage = 10;
  }
  attack(projectile_manager:ProjectileManager, position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, 
    scene: Phaser.Scene, angle: number, power_bar: Power.PowerBar){
      if(this.ready){
        if(this.use_power(power_bar)){
          const proj_ids = this.weapon_attack(projectile_manager, position, target, scene, angle, power_bar);
          this.ready = false;
          this.scene.time.addEvent({delay: this.cooldown, 
            callback: () => {
              this.ready = true;
          }});
        }
      }
  }

  weapon_attack(projectile_manager:ProjectileManager, position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, 
    scene: Phaser.Scene, angle: number, power_bar: Power.PowerBar): number[] | undefined
  {
    return undefined;
  
  }
}

export class NetWeapon extends Weapon{
  cooldown: number;
  ready: boolean;
  constructor(scene:Phaser.Scene, rel_x: number, rel_y: number, player: Player){
    super(scene, rel_x+player.x, rel_y+player.y, player, 'netshooter');
    this.cooldown = 1000;
    this.ready = true;
    this.power_usage = 10;
  }
  get_weapon_type(): WeaponTypes {
    return WeaponTypes.Net;
  }
  attack(projectile_manager:ProjectileManager, position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, 
    scene: Phaser.Scene, angle: number, power_bar: Power.PowerBar){
    if(this.ready){
      if(this.use_power(power_bar)){
        const net = new NetProjectile(scene, this.x, this.y)
        net.set_target(angle, target);
        this.ready = false;
        const proj_id = projectile_manager.add_projectile(net);

        this.scene.time.addEvent(
        {delay: this.cooldown, callback: 
          () => {
            this.ready = true;
          }
        })
        net.start_destroy_event(projectile_manager, proj_id);
        this.use_power(power_bar);
      }
    }
  }
}

export class WirePlacer extends Weapon{
  constructor(scene:Phaser.Scene, rel_x: number, rel_y: number, player: Player){
    super(scene, rel_x+player.x, rel_y+player.y, player, 'wireplacer');
    this.relative_position = new Phaser.Math.Vector2(16, -18);
  }
  get_weapon_type(): WeaponTypes {
    return WeaponTypes.Wire;
  }
}

export class BallWeapon extends CooldownWeapon{
  constructor(scene:Phaser.Scene, rel_x: number, rel_y: number, player: Player){
    super(scene, rel_x+player.x, rel_y+player.y, player, 'netshooter');
    this.relative_position = new Phaser.Math.Vector2(16, -18);
    this.power_usage = 1;
  }
  weapon_attack(projectile_manager:ProjectileManager, position: Phaser.Math.Vector2, target: Phaser.Math.Vector2, 
    scene: Phaser.Scene, angle: number, power_bar: Power.PowerBar): number[] | undefined
  {
    const ball = new Projectile.BallProjectile(scene, this.x, this.y);
    ball.set_target(angle, target);
    const proj_id = projectile_manager.add_projectile(ball);
    return [proj_id];
  }
  get_weapon_type(): WeaponTypes {
    return WeaponTypes.Ball;
  }
}