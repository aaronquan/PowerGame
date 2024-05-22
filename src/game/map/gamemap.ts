import { Player } from "../player/player";
import * as Wire from "../structures/power/wire";
import * as Grid from "./grid";
import * as Structure from "../structures/map/structure";
import * as StructureTiles from "../structures/map/structuretiles";
import * as Power from "./../structures/power/power";
import * as Turret from "./../structures/turret/turret";
import * as MapTiles from "./maptiles";

export class GameMap{
  grid:Grid.GridMap;
  wire_map: Wire.WirePowerMap;
  structure_map: Structure.StructureMap;
  cell_width: number;
  cell_height: number;
  scene: Phaser.Scene;
  power_bar: Power.PowerBar;

  highlights: Structure.StructureMap;

  generator_locations: Grid.GridCoordinate[];

  constructor(scene: Phaser.Scene, width:number, height:number){
    this.scene = scene;
    this.cell_height = 32;
    this.cell_width = 32;
    this.grid = new Grid.GridMap(width, height, 32, 32);
    this.wire_map = new Wire.WirePowerMap(width, height);
    this.structure_map = new Structure.StructureMap(width, height);
    this.highlights = new Structure.StructureMap(width, height);
    this.highlights.is_displayed = false;

    this.power_bar = new Power.PowerBar(100, 50);
  }
  init_grid(){
    this.grid.fill_walls(this.scene);
  }
  init_structures(){
    this.add_generator({x: 5, y: 5});
  }
  add_generator(coords: Grid.GridCoordinate): StructureTiles.GeneratorTile | undefined{
    this.wire_map.add_source(this.scene, coords);
    const generator = this.structure_map.add_structure_type(this.scene, 
      StructureTiles.StructureType.Generator, coords, this.power_bar);
    return generator ? generator as StructureTiles.GeneratorTile : undefined;
  }

  add_wire_on_player(world_point: Phaser.Math.Vector2, player:Player,
    wire_type: Wire.WireId
  ):boolean{
    if(player.n_wires == 0) return false;
    const player_grid_coords = player.get_grid_position(this.grid);
    const mouse_grid_coords = this.grid.grid_coords(world_point);
    if(player_grid_coords && mouse_grid_coords){
      const orth_distance = Grid.coordinate_orthogonal_distance(player_grid_coords, mouse_grid_coords);
      if(orth_distance <= 3){
        const has_added_wire = this.wire_map.add_wire(this.scene, wire_type, mouse_grid_coords);
        if(has_added_wire){
          player.n_wires--;
        }
        return has_added_wire;
      }
    }
    return false;
  }
  delete_wire_on_player(world_point: Phaser.Math.Vector2, player:Player):boolean{
    const player_grid_coords = player.get_grid_position(this.grid);
    const mouse_grid_coords = this.grid.grid_coords(world_point);
    if(player_grid_coords && mouse_grid_coords){
      const orth_distance = Grid.coordinate_orthogonal_distance(player_grid_coords, mouse_grid_coords);
      if(orth_distance <= 3){
        const wires_removed = this.wire_map.remove_wire(mouse_grid_coords);
        if(wires_removed > 0){
          player.n_wires += wires_removed;
        }
        return wires_removed > 0;
      }
    }
    return false;
  }

  add_turret(world_point: Phaser.Math.Vector2, turrets:Turret.TurretManager): number | undefined{
    const grid_coords = this.grid.grid_coords(world_point);
    if(grid_coords){
      const turret = this.structure_map.add_structure_type(this.scene, 
        StructureTiles.StructureType.BallProjectileTurret, grid_coords, this.power_bar);
      if(turret){
        this.refresh_power();
        return turrets.add_turret(turret as Turret.TurretBase);
      }
    }
    return undefined;
  }

  get_info(world_point: Phaser.Math.Vector2): GridInfo | undefined{
    const grid_coords = this.grid.grid_coords(world_point);
    if(grid_coords){
      const tile = this.grid.get_object(grid_coords);
      const power = this.wire_map.has_power(grid_coords);
      const structure = this.structure_map.get_structure(grid_coords);
      let structure_power = false;
      if(structure){
        structure_power = structure.power
      }

      return {x:grid_coords.x, y:grid_coords.y, 
        tile_type: tile?.get_type(),
        power: power, structure: structure?.get_id(), 
        structure_power: structure_power
      };
    }

    return undefined;
  }

  refresh_power(){
    const power_map = this.wire_map.refresh_power_map();
    this.structure_map.refresh_power(power_map);

    const coords = this.wire_map.power_map_actives();
    this.highlights.set_new_tiles_and_clear_others(this.scene, StructureTiles.StructureType.RedHighlight, coords, this.power_bar);
  }
  refresh_highlights(){
    this.wire_map.refresh_power_map();
    const coords = this.wire_map.power_map_actives();
    this.highlights.set_new_tiles_and_clear_others(this.scene, StructureTiles.StructureType.RedHighlight, coords, this.power_bar);
  }
  toggle_highlights(){
    this.highlights.toggle_visible();
  }
}


export type GridInfo = {
  x?: number, 
  y?: number,
  tile_type?: MapTiles.TileType,
  power: boolean,
  structure?: StructureTiles.StructureType,
  structure_power?: boolean
}