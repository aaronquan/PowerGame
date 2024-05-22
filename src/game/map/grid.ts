import * as MapTile from "./maptiles";

export class GridMap{
  object_map: (MapTile.MapTile | undefined)[][];
  width: number;
  height: number;
  cell_width: number;
  cell_height: number;
  walls?: Phaser.GameObjects.Group;
  wall_hit_boxes: Phaser.Geom.Rectangle[];
  constructor(width:number=10, height:number=10, cw:number=32, ch:number=32){
    this.width = width;
    this.height = height;
    this.object_map = [];
    for(let j = 0; j < this.height; j++){
      const row = [];
      for(let i = 0; i < this.width; i++){
        row.push(undefined);
      }
      this.object_map.push(row);
    }
    this.cell_width = cw;
    this.cell_height = ch;
    this.wall_hit_boxes = [];
  }
  is_point_inside_grid(point: Phaser.Math.Vector2):boolean{
    return point.x >= 0 && point.x < this.width*this.cell_width && point.y >= 0 && point.y < this.height*this.cell_height;
  }
  is_coord_inside_grid(coord:GridCoordinate):boolean{
    return coord.x >= 0 && coord.x < this.width && coord.y >= 0 && coord.y < this.height;
  }
  grid_coords(point: Phaser.Math.Vector2):GridCoordinate | undefined{
    if(!this.is_point_inside_grid(point)){
      return undefined;
    }
    return {x:Math.floor(point.x/this.cell_width), y:Math.floor(point.y/this.cell_height)};
  }
  grid_coords_decimal(point: Phaser.Math.Vector2):Phaser.Math.Vector2 | undefined{
    if(!this.is_point_inside_grid(point)){
      return undefined;
    }
    return new Phaser.Math.Vector2(point.x/this.cell_width, point.y/this.cell_height);
  }
  global_coordinates(coord:GridCoordinate, center:boolean=false): Phaser.Math.Vector2{
    if(center){
      return new Phaser.Math.Vector2(coord.x*this.cell_width+(this.cell_width/2), coord.y*this.cell_height+(this.cell_height/2));
    }
    return new Phaser.Math.Vector2(coord.x*this.cell_width, coord.y*this.cell_height);
  }
  draw_grid_object(scene: Phaser.Scene, x:number, y:number): Phaser.GameObjects.Grid{
    const x_offset = x+((this.width/2)*this.cell_width);
    const y_offset = y+((this.height/2)*this.cell_height);
    return scene.add.grid(x_offset, y_offset, this.width*this.cell_width, this.height*this.cell_height, 
      this.cell_width, this.cell_height, 0xff0000, undefined, 0xff00ff);
  }
  dist_map(coordinate: GridCoordinate | Phaser.Math.Vector2):number[][]{
    const dists = [];
    for(let j = 0; j < this.height; j++){
      const row_dists = [];
      for(let i = 0; i < this.width; i++){
        const dx = i - coordinate.x;
        const dy = j - coordinate.y;
        row_dists.push(dx*dx+dy*dy);

      }
      dists.push(row_dists);
    }
    return dists;
  }
  draw_grid_text(scene: Phaser.Scene, texts: string[][], x:number, y:number): (undefined | Phaser.GameObjects.Text)[][]{
    const x_offset = x;
    const y_offset = y;
    const text_handles = Array(this.height).fill(undefined).map(() => Array(this.width).fill(undefined));
    for(let j = 0; j < texts.length; j++){
      for(let i = 0; i < texts[j].length; i++){
        text_handles[j][i] = texts[j][i] !== '' ? 
        scene.add.text(x_offset+i*this.cell_width, y_offset+j*this.cell_height, texts[j][i]) : undefined;
      }
    }
    return text_handles;
  }
  draw_light_square(scene: Phaser.Scene, ls: LightSquare, light_max:number):Phaser.GameObjects.Rectangle{
    return scene.add.rectangle((ls.x+0.5)*this.cell_width, (ls.y+0.5)*this.cell_height, 
    this.cell_width, this.cell_height, 0x000000, Math.sqrt(ls.distance_sq/light_max));
  }
  fill_walls(scene: Phaser.Scene){
    this.walls = scene.add.group();
    //const x_offset = this.cell_width/2;
    //const y_offset = this.cell_height/2;
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        if(i == 0 || j == 0 || i == this.width - 1 || j == this.height - 1){
          const new_wall = new MapTile.MapWall(scene, i, j);
          //const new_wall = scene.physics.add.image(x_offset+i*this.cell_width, y_offset+j*this.cell_height, 'wall');
          this.object_map[j][i] = new_wall;
          this.walls.add(new_wall);
          //new_wall.setImmovable();
          
        }else{
          const new_floor = new MapTile.MapFloor(scene, i, j);
          //scene.add.image(x_offset+i*this.cell_width, y_offset+j*this.cell_height, 'grey')
          this.object_map[j][i] = new_floor;
        }
        const x_scale = this.cell_width/32;
        const y_scale = this.cell_height/32;
        this.object_map[j][i]?.setScale(x_scale, y_scale);
      }
    }

    //generate wall_hit_boxes
    this.wall_hit_boxes.push(new Phaser.Geom.Rectangle(0, 0, this.width*this.cell_width, this.cell_height));
    this.wall_hit_boxes.push(new Phaser.Geom.Rectangle(0, (this.height-1)*this.cell_height, this.width*this.cell_width, this.cell_height));
    this.wall_hit_boxes.push(new Phaser.Geom.Rectangle(0, this.cell_height, this.cell_width, this.cell_height*(this.height-1)));
    this.wall_hit_boxes.push(new Phaser.Geom.Rectangle((this.width-1)*this.cell_width, this.cell_height, this.cell_width, this.cell_height*(this.height-1)));
  }
  set_grid_all_invisible(){
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        this.object_map[j][i]?.setVisible(false);
      }
    }
  }
  set_grid_light_squares(squares:LightSquare[]){
    for(const square of squares){
      this.object_map[square.y][square.x]?.setVisible(true);
    }
  }
  get_object(coord:GridCoordinate): MapTile.MapTile | undefined{
    return this.object_map[coord.y][coord.x];
  }
}

export type GridDifference = {
  low: number, high: number,
  distance_sq: number
}

export type GridCoordinate = {
  x: number, y: number
}

export type LightSquare = GridCoordinate & {
  distance_sq: number
}

export function get_grid_positions(coord:GridCoordinate, grid_diff:GridDifference): GridCoordinate[]{
  const coords:GridCoordinate[] = [];
  if(grid_diff.low == 0){
    if(grid_diff.high == 0){
      coords.push({x: coord.x, y:coord.y});
    }else{
      coords.push({x: coord.x+grid_diff.high, y:coord.y});
      coords.push({x: coord.x-grid_diff.high, y:coord.y});
      coords.push({x: coord.x, y:coord.y+grid_diff.high});
      coords.push({x: coord.x, y:coord.y-grid_diff.high});
    }
  }else if(grid_diff.low == grid_diff.high){
    coords.push({x: coord.x+grid_diff.low, y:coord.y+grid_diff.low});
    coords.push({x: coord.x-grid_diff.low, y:coord.y-grid_diff.low});
    coords.push({x: coord.x+grid_diff.low, y:coord.y-grid_diff.low});
    coords.push({x: coord.x-grid_diff.low, y:coord.y+grid_diff.low});
  }else{
    coords.push({x: coord.x+grid_diff.low, y:coord.y+grid_diff.high});
    coords.push({x: coord.x-grid_diff.low, y:coord.y-grid_diff.high});
    coords.push({x: coord.x+grid_diff.low, y:coord.y-grid_diff.high});
    coords.push({x: coord.x-grid_diff.low, y:coord.y+grid_diff.high});
    coords.push({x: coord.x+grid_diff.high, y:coord.y+grid_diff.low});
    coords.push({x: coord.x-grid_diff.high, y:coord.y-grid_diff.low});
    coords.push({x: coord.x+grid_diff.high, y:coord.y-grid_diff.low});
    coords.push({x: coord.x-grid_diff.high, y:coord.y+grid_diff.low});
  }
  return coords;
}


export function coordinate_orthogonal_distance(coord1:GridCoordinate, coord2:GridCoordinate):number{
  const dx = Math.abs(coord1.x - coord2.x);
  const dy = Math.abs(coord1.y - coord2.y);
  return dx + dy;
}