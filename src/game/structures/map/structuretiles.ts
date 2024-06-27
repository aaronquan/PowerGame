
import {tile_width, tile_height, half_tile_width, half_tile_height} from '../../map/maptiles';
import * as Critter from "./../../enemies/critter";
import * as Entity from "./../../entity/entity";

export enum StructureType {
  Default, Generator, RedHighlight,
  BaseTurret, BallProjectileTurret, TazerTurret
}

export class StructureTile extends Entity.StaticDestroyableEntity{
  power: boolean;
  changed_power: boolean;
  //collision_area: Phaser.Geom.Rectangle;
  constructor(scene:Phaser.Scene, gx:number, gy:number, tile_texture:string){
    super(scene, gx*tile_width+half_tile_width, gy*tile_height+half_tile_height, tile_texture);
    this.power = false;
    this.changed_power = false;
  }
  get_id():StructureType{
    return StructureType.Default;
  }
  on_change_power(){
    
  }
  on_critter_collision(critter: Critter.Critter){
  }
}
export class GeneratorTile extends StructureTile{
  health: number;
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'generator');
    this.health = 1;
  }
  get_id():StructureType{
    return StructureType.Default;
  }
  on_critter_collision(critter: Critter.Critter){
    console.log("collision critter generator");
    console.log(critter);
    this.health -= critter.damage;
    if(this.health < 0){
      console.log("dies");
    }
  }
}

export class Turret extends StructureTile{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'generator');
  }
}
