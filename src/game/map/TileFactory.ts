import * as MapTiles from './maptiles';
import * as Texture from "../graphics/texture";

export class TileFactory{
  x: number;
  y: number;
  tile_width: number;
  tile_height: number;
  tile_textures: Map<string, Texture.ScaledTextureKey>;
  constructor(tile_width: number, tile_height: number, x:number=0, y: number=0){
    this.tile_width = tile_width; this.tile_height = tile_height;
    this.x = x; this.y = y;
    this.tile_textures = new Map<string, Texture.ScaledTextureKey>;
  }
  generate_tile(scene: Phaser.Scene, gx: number, gy: number, texture: string,
    tile_type:MapTiles.TileType=MapTiles.TileType.Default): MapTiles.MapTile{
    if(!this.tile_textures.has(texture)){
      this.create_scaled_texture(scene, texture);
    }
    const tx = this.x + gx*this.tile_width + this.tile_width/2;
    const ty = this.y + gy*this.tile_height+ this.tile_height/2;
    switch(tile_type){
      case MapTiles.TileType.Default:
        return new MapTiles.MapTile(scene, tx, ty, this.tile_textures.get(texture)!.key);
      //implement other types
    }
    return new MapTiles.MapTile(scene, tx, ty, this.tile_textures.get(texture)!.key);
  }
  create_scaled_texture(scene: Phaser.Scene, texture_name: string): Texture.ScaledTextureKey{
    const rescaled_name = texture_name+'_rescaled';
    const new_texture = Texture.rescale(scene, texture_name, rescaled_name, this.tile_width, this.tile_height);
    const new_texture_key = {key: new_texture != null ? rescaled_name : texture_name, texture: new_texture};
    this.tile_textures.set(texture_name, new_texture_key);
    return new_texture_key;
  }
}