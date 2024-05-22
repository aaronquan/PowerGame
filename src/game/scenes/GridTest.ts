import { Scene } from "phaser";
import { InputKeyMap } from "../../utils/keys";
import * as Weapons from "../player/weapons";
import * as Grid from "../map/grid";
import { GridMap } from "../map/grid";

import * as Player from "./../player/player";

import { RandomLinePath } from "../graphics/lines";
import * as Lines from './../graphics/lines';
import * as Critter from './../enemies/critter';

import * as GameMap from './../map/gamemap';
import { GridTestUI } from "../ui/main";

import * as Projectile from "../projectiles/projectile";

import * as Turret from './../structures/turret/turret';
import * as Wire from "../structures/power/wire";

export class GridTest extends Scene{
  camera: Phaser.Cameras.Scene2D.Camera;

  map: GameMap.GameMap;

  //grid: GridMap;
  player: Player.Player;
  key_map: InputKeyMap;
  ui: GridTestUI;
  //test_enemy: TestEnemy;
  //test_critter: Critter;

  critters: Critter.CritterCollection;

  //test_turret: Turret.BallProjectileTurret;
  turrets: Turret.TurretManager;

  string_map: (undefined | Phaser.GameObjects.Text)[][];
  light_squares_rectangles: Phaser.GameObjects.Rectangle[]; 


  //taze_line: Phaser.GameObjects.Graphics;
  constructor(){
    super('GridTest');
  }
  create (){
    this.ui = this.scene.add("GridTestUI", GridTestUI) as GridTestUI;
    this.scene.launch("GridTestUI");

    this.map = new GameMap.GameMap(this, 20, 20);
    this.map.init_grid();
    this.map.init_structures();
    
    this.key_map = new InputKeyMap();
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    this.player = new Player.Player(this, 100, 100);
    this.player.set_power_bar(this.map.power_bar);
    this.player.setDepth(1);
    this.camera.centerOn(this.player.x, this.player.y);

    this.turrets = new Turret.TurretManager();

    //this.test_turret = new Turret.BallProjectileTurret(this, 3, 3, this.map.power_bar);
    //this.test_turret.shoot(this.player.projectiles);
    //this.map.structure_map.add_structure(this.test_turret, {x:3, y:3});

    //this.turrets.add_turret(this.test_turret);
    this.turrets.update_power(this.player.projectiles);

    this.physics.add.collider(this.player, this.map.grid.walls!,
      (o1, o2) => {
        
      }
    )

    this.physics.add.collider(this.player.projectiles.as_array(), this.map.grid.walls!,
      (o1, o2) => {
        const proj = o1 as Projectile.Projectile;
        const id:number = proj.getData('id');
        this.player.projectiles.delete_projectile(id);
      }
    );
    //this.physics.add.collider(this.critters.) // to do critters / structure

    this.key_map.add_keys(this.input, ['W', 'A', 'S', 'D']);
    this.key_map.add_keys(this.input, [ Phaser.Input.Keyboard.KeyCodes.SHIFT, Phaser.Input.Keyboard.KeyCodes.CTRL]);
    this.input.on('pointermove', (pointer:Phaser.Input.Pointer) => {
      const world_point = this.camera.getWorldPoint(pointer.x, pointer.y);
      const info = this.map.get_info(world_point);
      this.ui.update_display_info(info);
    });
    this.input.on('pointerdown', (pointer:Phaser.Input.Pointer) => {
      const world_point = this.camera.getWorldPoint(pointer.x, pointer.y);
      if(this.key_map.is_key_down(Phaser.Input.Keyboard.KeyCodes.CTRL)){
        //place turret
        const grid_coords = this.map.grid.grid_coords(world_point);
        if(grid_coords){
          this.map.add_turret(world_point, this.turrets);
        }
      }
      else if(this.player.weapons.get_current_type() === Weapons.WeaponTypes.Wire){
        if(this.key_map.is_key_down(Phaser.Input.Keyboard.KeyCodes.SHIFT)){
          this.map.delete_wire_on_player(world_point, this.player);
          this.refresh_power();
        }
        else if(pointer.rightButtonDown()){
          this.map.add_wire_on_player(world_point, this.player, Wire.WireId.Vertical);
          this.refresh_power()
        }else if(pointer.leftButtonDown()){
          this.map.add_wire_on_player(world_point, this.player, Wire.WireId.Horizontal);
          this.refresh_power();
        }
      }
    });
    this.input.keyboard?.on('keydown', (e:KeyboardEvent) => {
      const key = e.key;
      if(key == '1'){
        this.change_weapon(0);
      }else if(key == '2'){
        this.change_weapon(1);
      }else if(key == '3'){
        this.change_weapon(2);
      }else if(key == '4'){
        this.change_weapon(3);
      }
      else if(key == 'p'){
        console.log(this.critters.critters);
      }
      else if(key == 'q'){
        if(this.player.weapons.get_current_type() === Weapons.WeaponTypes.Wire){
          
        }
        /*
        //test wire put down
        const pointer = this.input.activePointer;
        const world_point = this.camera.getWorldPoint(pointer.x, pointer.y);
        this.map.add_wire_on_player(world_point, this.player, WireId.Vertical);
        this.map.refresh_highlights();*/
      }
      else if(key == 'e'){
        /*
        const pointer = this.input.activePointer;
        const world_point = this.camera.getWorldPoint(pointer.x, pointer.y);
        this.map.add_wire_on_player(world_point, this.player, WireId.Horizontal);
        this.map.refresh_highlights();*/
      }
      else if(key == 'f'){
        console.log(this.turrets);
        console.log(this.map.structure_map);
      }
      else if(key == 'r'){
        const pointer = this.input.activePointer;
        const world_point = this.camera.getWorldPoint(pointer.x, pointer.y);
        this.map.delete_wire_on_player(world_point, this.player);
        this.map.refresh_highlights();
      }
      else if(key == 'g'){
        this.map.refresh_highlights();
        this.map.toggle_highlights();
      }else if(key == 'h'){
        this.critters.toggle_health_bars();
      }

      else if(key == 'z'){
        this.spawn_blue();
      }
    });
    
    this.string_map = [];
    this.light_squares_rectangles = [];

    this.critters = new Critter.CritterCollection();
    const tc = new Critter.BlueCritter(this, 250, 200);
    const tc2 = new Critter.BlueCritter(this, 300, 200);
    this.critters.add_critter(tc);
    this.critters.add_critter(tc2);

    this.time.addEvent({delay: 2000, callback: () => {
      //this.spawn_blue()
    }})
    
    const test_enemy_target = this.map.grid.global_coordinates({x:5, y:5}, true);
    console.log(test_enemy_target);
    this.critters.set_target(test_enemy_target);

    this.ui.init_weapons(this.player.weapons);
  }
  change_weapon(index: number){
    this.player.change_weapon(index);
    this.ui.weapon_ui.set_active(index);
  }
  display_debug_grid_text(){
    for(const row of this.string_map){
      for(const text of row){
        if(text) text.destroy();
      }
    }
    const string_map = this.player.dist_map.map((row) => row.map((dist) => dist ? dist.toString() : ''));
    this.string_map = this.map.grid.draw_grid_text(this, string_map, 0, 0);

    
  }
  refresh_power(){
    this.map.refresh_power();
    this.turrets.update_power(this.player.projectiles);
  }
  spawn_blue(){
    this.critters.spawn(this, new Phaser.Math.Vector2(400, 400), Critter.CritterType.Blue);
    const test_enemy_target = this.map.grid.global_coordinates({x:5, y:5});
    this.critters.set_target(test_enemy_target);
    /*this.time.addEvent({delay: 2000, callback: () => {
      this.spawn_blue()
    }})*/
  }
  update(){
    const pointer = this.input.activePointer;
    const world_point = this.camera.getWorldPoint(pointer.x, pointer.y);
    this.ui.info_debug.new_position(world_point);
    //this.camera.useBounds = true
    //console.log(this.camera.worldView);
    const camera_bounds = this.camera.worldView;

    //this.test_turret.aim_closest_critter(this.critters);

    if(this.input.mousePointer.leftButtonDown()){
      this.player.shoot_weapon(world_point);
    }else{
      this.player.stop_weapon();
    }

    this.player.projectiles.cull_out_of_bounds(camera_bounds);
    this.player.projectiles.test_wall(this.map.grid.wall_hit_boxes); 

    this.player.move_player(this.key_map);
    this.player.rotate_player(world_point);
    this.player.update_projectiles();

    this.critters.update();
    //console.log(this.critters);

    this.critters.player_hit_enemy_test(this.player.projectiles);

    const generator_tiles = this.map.get_generator_tiles();
    for(const tile of generator_tiles){
      this.critters.collision_structure_tile(tile);
    }

    const world_return = this.player.update_from_world(this.map.grid);
    if(world_return.changed_coords){
      this.map.grid.set_grid_all_invisible();
      
      for(const square of this.light_squares_rectangles){
        square.destroy();
      }
      this.light_squares_rectangles = [];
      for(const sq of world_return.light_squares){
        this.light_squares_rectangles.push(this.map.grid.draw_light_square(this, sq, this.player.vision_range*this.player.vision_range));
      }
      this.map.grid.set_grid_light_squares(world_return.light_squares);
    }

    const player_point_on_grid = this.map.grid.grid_coords(this.player.get_position());


    this.camera.centerOn(this.player.x, this.player.y);
    
    this.ui.update_power_bar(this.player.power_bar);
    this.player.power_bar.regen();
    this.ui.update_player_stats(this.player);
    this.ui.update_weapons(this.player.weapons);

    this.turrets.update_aim_turrets(this.critters);
    this.turrets.update_turret_shooting(this.player.projectiles);
  }
}

