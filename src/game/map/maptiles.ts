import { DisplayPhysicsImage } from "../graphics/sprites";

export const tile_width = 32;
export const tile_height = 32;
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

export class MapTile extends DisplayPhysicsImage{
  constructor(scene:Phaser.Scene, gx:number, gy:number, tile_texture:string){
    super(scene, gx*tile_width+half_tile_width, gy*tile_height+half_tile_height, tile_texture);
  }
  get_type():TileType{
    return TileType.Default;
  }
}

export class MapFloor extends MapTile{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'grey');
  }
  get_type():TileType{
    return TileType.Floor;
  }
}

export class MapWall extends MapTile{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'wall');
  }
  get_type():TileType{
    return TileType.Wall;
  }
}

export class RedHighlight extends MapTile{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'wall');
  }
  get_type():TileType{
    return TileType.RedHighlight;
  }
}