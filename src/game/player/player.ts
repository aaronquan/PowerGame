import { InputKeyMap } from "../../utils/keys";
import * as Weapons from "./weapons";
import * as Grid from "./../map/grid";
import * as Projectile from "../projectiles/projectile";

import * as Power from "./../structures/power/power";
import * as GameMap from './../map/gamemap';

export class Player extends Phaser.Physics.Arcade.Sprite{
  move_speed:number;
  vision_range: number;
  grid_position: Grid.GridCoordinate;
  dist_map: (number | undefined)[][];
  weapons: Weapons.WeaponHolder;

  rotate_angle: number;
  projectiles: Projectile.ProjectileManager;

  is_shooting: boolean;

  immunity_duration: number;
  power_bar: Power.PowerBar;

  n_wires: number;

  constructor(scene: Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'player');
    scene.physics.add.existing(this);
    scene.sys.displayList.add(this);
    scene.sys.updateList.add(this);

    this.move_speed = 100;
    this.vision_range = 17;
    this.grid_position = {x: 0, y: 0};
    this.dist_map = [];
    this.rotate_angle = 0;

    this.n_wires = 10;

    this.weapons = new Weapons.WeaponHolder(4);

    this.projectiles = new Projectile.ProjectileManager();

    //adding weapons
    const wire_placer = new Weapons.WirePlacer(this.scene, 0, 0, this);
    this.weapons.swap_weapon(0, wire_placer);

    const tazer = new Weapons.TazerWeapon(this.scene, 12, -17, this);
    this.weapons.swap_weapon(1, tazer);

    const net = new Weapons.NetWeapon(this.scene, 0, 0, this);
    this.weapons.swap_weapon(2, net);

    const ball_wep = new Weapons.BallWeapon(this.scene, 0, 0, this);
    this.weapons.swap_weapon(3, ball_wep);

    this.is_shooting = false;

    this.immunity_duration = 1000;
    //this.power_bar = new PowerBar(100, 50);
  }
  set_power_bar(power_bar: Power.PowerBar){
    this.power_bar = power_bar
  }
  move_player(keys:InputKeyMap){
    const move_velocity = new Phaser.Math.Vector2();
    if(keys.is_key_down('A')){
      move_velocity.x = -this.move_speed;
    }else if(keys.is_key_down('D')){
      move_velocity.x = this.move_speed;
    }
    if(keys.is_key_down('W')){
      move_velocity.y = -this.move_speed;
    }else if(keys.is_key_down('S')){
      move_velocity.y = this.move_speed;
    }
    move_velocity.limit(this.move_speed);
    this.setVelocity(move_velocity.x, move_velocity.y);
    //this.extensions.setXY(this.x+12, this.y+-17); //
  }
  change_weapon(weapon_slot:number){
    this.weapons.change(weapon_slot, this.projectiles);
  }
  shoot_weapon(mouse_world_position: Phaser.Math.Vector2){
    const position = new Phaser.Math.Vector2(this.x, this.y);
    const mouse_position = new Phaser.Math.Vector2(mouse_world_position.x, mouse_world_position.y);
    this.weapons.shoot(this.projectiles, position, mouse_position,
    this.scene, this.rotate_angle, this.power_bar);
    this.is_shooting = true;
  }
  stop_weapon(){
    this.weapons.stop(this.projectiles);
    this.is_shooting = false;
  }
  get_rotate_angle(mouse_world_position: Phaser.Math.Vector2){
    const vec = new Phaser.Math.Vector2(mouse_world_position.x - this.x, mouse_world_position.y - this.y);
    const angle = vec.angle()+Math.PI/2;
    this.rotate_angle = angle;
  }
  rotate_player(mouse_world_position: Phaser.Math.Vector2){
    this.get_rotate_angle(mouse_world_position);
    this.setRotation(this.rotate_angle);
    const base_position = new Phaser.Math.Vector2(this.x, this.y);
    this.weapons.rotate(this.rotate_angle, base_position);
  }
  get_position():Phaser.Math.Vector2{
    return new Phaser.Math.Vector2(this.x, this.y);
  }
  get_grid_position(grid:Grid.GridMap): Grid.GridCoordinate | undefined{
    return grid.grid_coords(this.get_position());
  }
  update_from_world(grid:Grid.GridMap) : WorldUpdateReturn{
    if(this.dist_map.length === 0){
      this.dist_map = Array(grid.height).fill(undefined).map(() => Array(grid.width).fill(undefined));
    }
    const vector_position = this.get_position();
    const coords = grid.grid_coords(vector_position);
    let changed_coords = false;
    const light_squares = [];
    if(coords){
      if(this.grid_position.x !== coords.x || this.grid_position.y !== coords.y){
        changed_coords = true;
        const grid_diffs = this.get_vision_grid_differences();
        for(const diff of grid_diffs){
          const positions = Grid.get_grid_positions(coords, diff);
          for(const pos of positions){
            if(grid.is_coord_inside_grid(pos)){
              this.dist_map[pos.y][pos.x] = diff.distance_sq;
              light_squares.push({x: pos.x, y: pos.y, distance_sq: diff.distance_sq});
            }
          }
        }
      }
      this.grid_position = coords;
    }
    return {changed_coords, light_squares};
  }
  update_projectiles(){
    this.projectiles.update();
  }
  get_vision_grid_differences():Grid.GridDifference[]{
    const grid_diffs:Grid.GridDifference[] = [];
    const vision_sq = this.vision_range*this.vision_range;
    for(let i = 0; i <= this.vision_range; i++){
      for(let j = i; j <= this.vision_range; j++){
        const dist_sq = i*i+j*j;
        if(dist_sq <= vision_sq){
          grid_diffs.push({low: i, high: j, distance_sq: dist_sq});
        }

      }
    }
    grid_diffs.sort((a, b) => a.distance_sq - b.distance_sq);
    return grid_diffs;
  }
}

type WorldUpdateReturn = {
  changed_coords: boolean;
  light_squares: Grid.LightSquare[];
}