import { GridCoordinate } from "../../map/grid";

import * as StructureTiles from "./structuretiles";
import * as Turret from "./../turret/turret";
import * as Player from "./../../player/player";
import * as Power from "./../power/power";

export class StructureMap{
  tiles: (StructureTiles.StructureTile | undefined)[][];
  width: number;
  height: number;
  is_displayed: boolean;
  constructor(w:number, h:number){
    this.width = w;
    this.height = h;
    this.tiles = [];
    for(let j = 0; j < this.height; j++){
      const tile_row:(StructureTiles.StructureTile | undefined)[] = [];
      for(let i = 0; i < this.width; i++){
        tile_row.push(undefined);
      }
      this.tiles.push(tile_row);
    }
    this.is_displayed = true;
  }

  get_structure_tiles(coords: GridCoordinate[]): StructureTiles.StructureTile[] {
    const tiles:StructureTiles.StructureTile[] = [];
    for(const coord of coords){
      const tile = this.get_structure(coord);
      if(tile) tiles.push(tile);
    }
    return tiles;
  }

  //only adds if no structure present
  add_structure_type(scene: Phaser.Scene, type:StructureTiles.StructureType, 
    coord:GridCoordinate, power:Power.PowerBar):StructureTiles.StructureTile | undefined{
    if(this.has_structure(coord)) return undefined;
    let structure: StructureTiles.StructureTile | undefined = undefined;
    switch(type){
      case StructureTiles.StructureType.Default:
        break;
      case StructureTiles.StructureType.Generator:
        structure = new StructureTiles.GeneratorTile(scene, coord.x, coord.y);
        break;
      case StructureTiles.StructureType.RedHighlight:
        structure = new StructureTiles.RedHighlight(scene, coord.x, coord.y);
        break;
      case StructureTiles.StructureType.BallProjectileTurret:
        structure = new Turret.BallProjectileTurret(scene, coord.x, coord.y, power);
        break;
      default:
        break;
    } 
    if(structure !== undefined) this.add_structure(structure, coord)
    return structure;
  }
  add_structure(structure: StructureTiles.StructureTile, coord:GridCoordinate){
    this.tiles[coord.y][coord.x]?.destroy();
    this.tiles[coord.y][coord.x] = structure;
    structure?.setVisible(this.is_displayed);
  }
  has_structure(coord:GridCoordinate):boolean{
    return this.tiles[coord.y][coord.x] !== undefined;
  }
  get_structure(coord:GridCoordinate) : StructureTiles.StructureTile | undefined{
    return this.tiles[coord.y][coord.x];
  }
  clear(){
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        this.tiles[j][i]?.destroy();
        this.tiles[j][i] = undefined;
      }
    }
  }
  toggle_visible(){
    this.is_displayed = !this.is_displayed;
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
          this.tiles[j][i]?.setVisible(this.is_displayed);
      }
    }
  }
  set_new_tiles_and_clear_others(scene: Phaser.Scene, type:StructureTiles.StructureType, 
    coords: GridCoordinate[], power: Power.PowerBar){
    //coords are sorted
    const coord_stack = [...coords];
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        if(coord_stack.length === 0){
          break;
        }
        const first = coord_stack[0];
        if(i == first.x && j == first.y){
          if(this.tiles[j][i] === undefined){
            this.add_structure_type(scene, type, {x: i, y: j}, power);
          }else if(this.tiles[j][i]!.get_id() !== type){
            this.tiles[j][i]?.destroy();
            this.tiles[j][i] = undefined;
            this.add_structure_type(scene, type, {x: i, y: j}, power);
          }
          coord_stack.shift();
        }else{
          this.tiles[j][i]?.destroy();
          this.tiles[j][i] = undefined;
        }
      }
      if(coord_stack.length === 0){
        break;
      }
    }
  }
  refresh_power(power_map:boolean[][]){
    for(let j=0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        if(this.tiles[j][i]){
          const old_power = this.tiles[j][i]!.power;
          this.tiles[j][i]!.power = power_map[j][i];
          if(power_map[j][i] != old_power){
            this.tiles[j][i]!.changed_power = true;
          }
        }
      }
    }
  }
}