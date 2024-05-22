import { DisplaySprite } from '../../graphics/sprites';
import {tile_width, tile_height, half_tile_width, half_tile_height} from '../../map/maptiles';
import * as Critter from "./../../enemies/critter";
import * as Entity from "./../../entity/entity";

export enum StructureType {
  Default, Generator, RedHighlight,
  BaseTurret, BallProjectileTurret
}

export class StructureTile extends DisplaySprite{
  power: boolean;
  changed_power: boolean;
  //collision_area: Phaser.Geom.Rectangle;
  constructor(scene:Phaser.Scene, gx:number, gy:number, tile_texture:string){
    super(scene, gx*tile_width+half_tile_width, gy*tile_height+half_tile_height, tile_texture);
    this.power = false;
    this.changed_power = false;
    //this.collision_area = 
  }
  get_id():StructureType{
    return StructureType.Default;
  }
  on_change_power(){
    
  }
  on_critter_collision(critter: Critter.Critter){
  }
}

export class RedHighlight extends StructureTile{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'redhighlight');
  }
  get_id():StructureType{
    return StructureType.RedHighlight;
  }
}

export class GeneratorTile extends StructureTile{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'generator');
  }
  get_id():StructureType{
    return StructureType.Default;
  }
  on_critter_collision(critter: Critter.Critter){
    console.log("collision critter generator");
    console.log(critter);
  }
}

export class Turret extends StructureTile{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'generator');
  }
}
