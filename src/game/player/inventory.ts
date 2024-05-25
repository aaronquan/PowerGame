import * as Entity from "./../entity/entity";
import * as Grid from "./../map/grid";

export class PlayerInventory{
  width: number;
  height: number;
  inventory: Entity.InventoryEntity[][];
  available: Grid.GridCoordinate | undefined;
  constructor(width: number, height:number){
    this.width = width; this.height = height;
    this.inventory = [];
    for(let j = 0; j < this.height; j++){
      const inventory_row = [];
      for(let i = 0; i < this.width; i++){
        inventory_row.push(Entity.InventoryEntity.new_blank());
      }
    }
    this.available = {x: 0, y: 0};
  }
  add_entity(entity: Entity.InventoryEntity): boolean{
    if(this.available){
      this.inventory[this.available.y][this.available.x] = entity;
      return true;
    }
    this.next_available();
    return false;
  }
  in_inventory(coord:Grid.GridCoordinate):boolean{
    return coord.x >= 0 && coord.y >= 0 && coord.x < this.width && coord.y < this.height;
  }
  is_available(coord:Grid.GridCoordinate):boolean{
    return this.inventory[coord.y][coord.x].is_blank();
  }
  next_available(): Grid.GridCoordinate | undefined{
    let next = this.next_coordinate();
    if(next){
      while(!this.is_available(next!)){
        if(next == undefined) return undefined;
        this.available = next;
        next = this.next_coordinate();
      }
    }else{
      return undefined
    }
    return this.available;
  }
  next_coordinate(): Grid.GridCoordinate | undefined{
    if(!this.available) return undefined;
    const new_coord: Grid.GridCoordinate = {...this.available};
    if(new_coord){
      if(new_coord.x == this.width - 1){
        new_coord.y += 1;
        if(new_coord.y == this.height) return undefined;
        new_coord.x = 0;
      }else{
        new_coord.x += 1;
      }
    }
    return new_coord;
  }
  // -1 - first less, 0 - equal, 1 - first higher
  static compare_coordinate(coord1: Grid.GridCoordinate, coord2: Grid.GridCoordinate): number{
    if(coord1.y < coord2.y){
      return -1;
    }else if(coord1.y > coord2.y){
      return 1;
    }
    if(coord1.x < coord2.x){
      return -1;
    }else if(coord1.x > coord2.x){
      return 1;
    }
    return 0;
  }
}