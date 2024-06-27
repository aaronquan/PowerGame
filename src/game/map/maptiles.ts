
import * as Sprites from "../graphics/sprites";

export const tile_width = 50;
export const tile_height = 50;
export const half_tile_width = tile_width/2;
export const half_tile_height = tile_height/2;

export enum TileType {
  Default, Wall, Floor, RedHighlight
}

export function tile_type_to_string(tile:TileType): string{
  switch(tile){
    case TileType.Default:
      return "default";
    case TileType.Wall:
      return "wall";
    case TileType.Floor:
      return "floor";
    case TileType.RedHighlight:
      return "redhl";
  }
}

export class MapTile extends Sprites.DisplayImage{
  constructor(scene:Phaser.Scene, x:number, y:number, tile_texture:string){
    super(scene, x, y, tile_texture);
  }
  get_type():TileType{
    return TileType.Default;
  }
}

//may not need 
export class MapFloor extends MapTile{
  constructor(scene:Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'grey');
  }
  get_type():TileType{
    return TileType.Floor;
  }
}

export class MapWall extends MapTile{
  constructor(scene:Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'wall');
  }
  get_type():TileType{
    return TileType.Wall;
  }
}

export class RedHighlight extends MapTile{
  constructor(scene:Phaser.Scene, x:number, y:number){
    super(scene, x, y, 'wall');
  }
  get_type():TileType{
    return TileType.RedHighlight;
  }
}