import { DisplaySprite } from "../../graphics/sprites";
import { GridCoordinate } from "../../map/grid";

export enum WireId {
  Empty, Vertical, Horizontal, Cross, Source
}

function get_wire_surroundings(coord:GridCoordinate, id:WireId):GridCoordinate[]{
  const surrounding:GridCoordinate[] = [];
  switch(id){
    case WireId.Horizontal:
      surrounding.push({x: coord.x-1, y: coord.y});
      surrounding.push({x: coord.x+1, y: coord.y});
      break;
    case WireId.Vertical:
      surrounding.push({x: coord.x, y: coord.y-1});
      surrounding.push({x: coord.x, y: coord.y+1});
      break;
    case WireId.Cross:
      surrounding.push({x: coord.x-1, y: coord.y});
      surrounding.push({x: coord.x+1, y: coord.y});
      surrounding.push({x: coord.x, y: coord.y-1});
      surrounding.push({x: coord.x, y: coord.y+1});
      break;
    case WireId.Source:
      surrounding.push({x: coord.x-1, y: coord.y});
      surrounding.push({x: coord.x+1, y: coord.y});
      surrounding.push({x: coord.x, y: coord.y-1});
      surrounding.push({x: coord.x, y: coord.y+1});
      break;
  }
  return surrounding;
}

export class PowerWire extends DisplaySprite{
  constructor(scene:Phaser.Scene, gx:number, gy:number, wire_texture:string){
    super(scene, gx*32+16, gy*32+16, wire_texture);
  }
  get_id():WireId{
    return WireId.Empty;
  }
}

export class SourceWire extends PowerWire{
  get_id():WireId{
    return WireId.Source;
  }
}

export class VerticalWire extends PowerWire{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'verticalwire');
  }
  get_id():WireId{
    return WireId.Vertical;
  }
}

export class HorizontalWire extends PowerWire{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'horizontalwire');
  }
  get_id():WireId{
    return WireId.Horizontal;
  }
}

export class CrossWire extends PowerWire{
  constructor(scene:Phaser.Scene, gx:number, gy:number){
    super(scene, gx, gy, 'crosswire');
  }
  get_id():WireId{
    return WireId.Cross;
  }
}


export class WirePowerMap{
  width:number;
  height: number;
  wire_sprites: (PowerWire | undefined)[][];
  source_locations: GridCoordinate[];
  power_map: boolean[][];
  constructor(w:number, h:number){
    this.width = w;
    this.height = h;
    //this.wires = [];
    this.wire_sprites = [];
    for(let j = 0; j < this.height; j++){
      const wire_row:WireId[] = [];
      const wire_sprite_row: (PowerWire | undefined)[] = [];
      for(let i = 0; i < this.width; i++){
        wire_row.push(WireId.Empty);
        wire_sprite_row.push(undefined);
      }
      this.wire_sprites.push(wire_sprite_row);
    }

    this.source_locations = [];
    this.power_map = this.init_boolean_map(false);
  }
  is_coordinate_in_grid(gc:GridCoordinate){
    return gc.x >= 0 && gc.x < this.width && gc.y >= 0 && gc.y < this.height;
  }
  add_wire(scene: Phaser.Scene, wire_type:WireId, coord: GridCoordinate):boolean{
    const coord_wire = this.wire_sprites[coord.y][coord.x];
    switch(wire_type){
      case WireId.Horizontal:
        if(coord_wire){
          if(coord_wire.get_id() === WireId.Vertical){
            coord_wire.destroy();
            this.wire_sprites[coord.y][coord.x] = new CrossWire(scene, coord.x, coord.y);
            return true;
          }
          return false;
        }
        this.wire_sprites[coord.y][coord.x] = new HorizontalWire(scene, coord.x, coord.y);
        return true;
      case WireId.Vertical:
        if(coord_wire){
          if(coord_wire.get_id() === WireId.Horizontal){
            coord_wire.destroy();
            this.wire_sprites[coord.y][coord.x] = new CrossWire(scene, coord.x, coord.y);
            return true;
          }
          return false;
        }
        this.wire_sprites[coord.y][coord.x] = new VerticalWire(scene, coord.x, coord.y);
        return true;
    }
    return false;
  }
  /**
   * 
   * @param coord x y of wire
   * @returns number of wires removed
   */
  remove_wire(coord:GridCoordinate):number{
    const coord_wire = this.wire_sprites[coord.y][coord.x];
    if(coord_wire){
      coord_wire.destroy();
      
      console.log(coord_wire);
      switch(coord_wire.get_id()){
        case WireId.Vertical:
          this.wire_sprites[coord.y][coord.x] = undefined;
          return 1;
        case WireId.Horizontal:
          this.wire_sprites[coord.y][coord.x] = undefined;
          return 1;
        case WireId.Cross:
          this.wire_sprites[coord.y][coord.x] = undefined;
          return 2;
      }
    }
    return 0;
  }
  add_source(scene: Phaser.Scene, gc:GridCoordinate){
    if(!this.source_locations.includes(gc)){
      this.source_locations.push(gc);
      this.wire_sprites[gc.y][gc.x] = new SourceWire(scene, gc.x, gc.y, 'nothing');
    }
  }
  remove_source(gc:GridCoordinate){
    const index = this.source_locations.findIndex((c) => c.x == gc.x && c.y == gc.y);
    if(index !== -1){
      this.source_locations.splice(index, 1);
      this.wire_sprites[gc.y][gc.x]?.destroy();
      this.wire_sprites[gc.y][gc.x] = undefined;
    }
  }
  init_boolean_map(value: boolean):boolean[][]{
    const map = [];
    for(let j = 0; j < this.height; j++){
      const map_row = [];
      for(let i = 0; i < this.width; i++){
        map_row.push(value);
      }
      map.push(map_row);
    }
    return map;
  }
  refresh_power_map():boolean[][]{
    const map = this.init_boolean_map(false);
    const next_cells = [...this.source_locations];
    while(next_cells.length > 0){
      const next = next_cells.pop()!;
      //console.log(next);
      const wire_id = this.wire_sprites[next.y][next.x]?.get_id();
      map[next.y][next.x] = true;
      if(wire_id){
        let surround_cells:GridCoordinate[] = get_wire_surroundings({x:next.x, y:next.y}, wire_id);
        for(const cell of surround_cells){
          if(this.is_coordinate_in_grid(cell) && map[cell.y][cell.x] == false){
            next_cells.push(cell);
          }
        }
      }
    }
    this.power_map = map;
    //console.log(map);
    return map;
  }
  power_map_actives(): GridCoordinate[]{
    const coords: GridCoordinate[] = [];
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        if(this.power_map[j][i]){
          coords.push({x: i, y: j});
        }
      }
    }
    return coords;
  }
  has_power(coord:GridCoordinate):boolean{
    return this.power_map[coord.y][coord.x];
  }
}