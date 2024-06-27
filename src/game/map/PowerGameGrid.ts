import * as MapTiles from "./maptiles";
import * as StructureTiles from './../structures/map/structuretiles';
import * as Grid from './grid';
import * as TileFactory from './TileFactory';

export type PowerGameGridTile = {
  tile?: MapTiles.MapTile;
  structure?: StructureTiles.StructureTile;
  highlight?: MapTiles.RedHighlight;
}

export class PowerGameGrid{
  scene: Phaser.Scene;
  grid_map: Grid.GenericObjectGrid<PowerGameGridTile>;
  tile_factory: TileFactory.TileFactory;
  constructor(scene:Phaser.Scene, x: number=0, y:number=0){
    this.scene = scene;
    this.grid_map = new Grid.GenericObjectGrid<PowerGameGridTile>(5, 5, MapTiles.tile_width, MapTiles.tile_height, x, y);
    this.tile_factory = new TileFactory.TileFactory(MapTiles.tile_width, MapTiles.tile_height, x, y)
  }
  initialise(){
    for(let y = 0; y < this.grid_map.height; y++){
      for(let x = 0; x < this.grid_map.width; x++){
        //const global_coords = this.grid_map.global_coordinates({x, y}, );
        const tile = this.tile_factory.generate_tile(this.scene, x, y, 'test_tile');
        this.grid_map.add_object(x, y, {tile});
      }
    }
  }
}