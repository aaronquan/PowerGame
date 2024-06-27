import * as Inventory from "./../entity/inventory/inventory";
import * as AllInventory from "./../entity/inventory/all_inventory";
import * as Grid from "./../map/grid";
import { PlayerInventoryUI } from "../ui/player_inventory";

export type SwapInventory = {
  old: Grid.GridCoordinate;
  new: Grid.GridCoordinate;
}

export type InventoryAction = {
  select?: Grid.GridCoordinate;
  swap?: SwapInventory;
  place_single?: Grid.GridCoordinate;
  stack?: boolean;
}

export class PlayerInventory{
  width: number;
  height: number;
  inventory: Inventory.InventoryEntity[][];
  ui?: PlayerInventoryUI;
  entity_counts: Map<Inventory.InventoryEntityId, number>;
  available: Grid.GridCoordinate | undefined;
  selected_coord: Grid.GridCoordinate | undefined;
  constructor(width: number, height:number){
    this.width = width; this.height = height;
    this.inventory = [];
    for(let j = 0; j < this.height; j++){
      const inventory_row = [];
      for(let i = 0; i < this.width; i++){
        inventory_row.push(Inventory.InventoryEntity.new_blank());
      }
      this.inventory.push(inventory_row);
    }
    this.ui = undefined;
    this.entity_counts = new Map();
    this.available = {x: 0, y: 0};
    this.selected_coord = undefined;
  }
  connect_ui(ui: PlayerInventoryUI){
    this.ui = ui;
  }
  mouse_over(pointer: Phaser.Input.Pointer): Grid.GridCoordinate | undefined{
    const inventory_grid_coords = this.ui?.mouse_over(pointer, this.width, this.height);
    this.ui?.hover_on(inventory_grid_coords, this.height);
    return inventory_grid_coords;
  }
  mouse_down(pointer: Phaser.Input.Pointer){
    const inventory_grid_coords = this.ui?.mouse_over(pointer, this.width, this.height);

    if(pointer.rightButtonDown()){
      if(this.selected_coord && inventory_grid_coords){
        const pointer_entity = this.get_entity_coord(inventory_grid_coords);
        const selected_entity = this.get_entity_coord(this.selected_coord);
        const action = this.ui?.mouse_right_down(inventory_grid_coords, this.height, selected_entity, pointer_entity);
        if(action && action.place_single){
          this.remove_from_entity_coord(this.selected_coord, 1);
          this.add_entity_coord(inventory_grid_coords, 1, selected_entity.id);
        }
      }
    }else if(pointer.leftButtonDown()){
      const action = this.ui?.mouse_left_down(inventory_grid_coords, this.height);
      if(action && action.select){
        this.selected_coord = action.select;
      }
    }
  }
  mouse_up(pointer: Phaser.Input.Pointer){
    const inventory_grid_coords = this.ui?.mouse_over(pointer, this.width, this.height);
    if(pointer.leftButtonReleased()){
      if(this.selected_coord && inventory_grid_coords){
        const pointer_entity = this.get_entity_coord(inventory_grid_coords);
        const selected_entity = this.get_entity_coord(this.selected_coord);
        const action = this.ui?.mouse_left_up(inventory_grid_coords, this.height, selected_entity, pointer_entity);
        if(action && action.swap){
          this.swap(action.swap.new, action.swap.old);
        }
        if(action && action.stack){
          this.stack(inventory_grid_coords, this.selected_coord);
        }
        this.selected_coord = undefined;
      }
    }else{
      
    }
  }
  get_entity_coord(coord:Grid.GridCoordinate): Inventory.InventoryEntity{
    return this.inventory[coord.y][coord.x];
  }
  remove_from_entity_coord(coord:Grid.GridCoordinate, n: number){
    const entity = this.get_entity_coord(coord);
    const is_empty = entity.remove_stack(n);
    if(is_empty){
      this.add_blank_coord(coord);
    }
    
  }
  add_blank_coord(coord: Grid.GridCoordinate){
    this.inventory[coord.y][coord.x] = Inventory.InventoryEntity.new_blank();
    this.find_available();
  }
  add_entity_coord(coord: Grid.GridCoordinate, n: number, id: Inventory.InventoryEntityId): number{
    if(id === Inventory.InventoryEntityId.Blank){
      this.add_blank_coord(coord);
    }else{
      const current_entity = this.get_entity_coord(coord);
      if(current_entity.is_blank()){
        this.inventory[coord.y][coord.x] = AllInventory.entity_inventory_from_id(id);
        const rem = this.inventory[coord.y][coord.x].add_to_stack(n-1);
        return rem;
      }else{
        const rem = current_entity.add_to_stack(n);
        return rem;
      }
    }
    return n;
  }
  stack(to:Grid.GridCoordinate, from: Grid.GridCoordinate){
    const to_entity = this.inventory[to.y][to.x];
    const from_entity = this.inventory[from.y][from.x];
    if(to_entity.can_add_stack(from_entity.stack_count)){
      to_entity.add_to_stack(from_entity.stack_count);
      this.add_blank_coord(from);
    }else{
      console.log("full stack");
    }
  }
  swap(c1:Grid.GridCoordinate, c2: Grid.GridCoordinate): void{
    const tmp = this.inventory[c1.y][c1.x];
    this.inventory[c1.y][c1.x] = this.inventory[c2.y][c2.x];
    this.inventory[c2.y][c2.x] = tmp;
    this.find_available();
  }
  find_available(): boolean{
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        const ent = this.inventory[j][i];
        if(ent.type == Inventory.InventoryEntityType.Blank){
          this.available = {x: i, y: j};
          return true;
        }
      }
    }
    return false;
  }

  find_first_free_entity_type(type: Inventory.InventoryEntityType): Grid.GridCoordinate | undefined{
    //const found: Grid.GridCoordinate | undefined = undefined;
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        const ent = this.inventory[j][i];
        if(ent.type == type && !ent.is_max_stack()){
          return {x: i, y: j};
        }
      }
    }
    return undefined;
  }
  find_first_free_entity_id(id: Inventory.InventoryEntityId): Grid.GridCoordinate | undefined{
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        const ent = this.inventory[j][i];
        if(ent.id == id && !ent.is_max_stack()){
          return {x: i, y: j};
        }
      }
    }
    return undefined;
  }
  find_first_has_entity_id(id: Inventory.InventoryEntityId): Grid.GridCoordinate | undefined{
    for(let j = 0; j < this.height; j++){
      for(let i = 0; i < this.width; i++){
        const ent = this.inventory[j][i];
        if(ent.id == id){
          return {x: i, y: j};
        }
      }
    }
    return undefined;
  }
  find_entity_id_count(id: Inventory.InventoryEntityId): number{
    if(this.entity_counts.has(id)){
      return this.entity_counts.get(id)!;
    }
    return 0;
  }

  add_entity(entity: Inventory.InventoryEntity, n:number=1): boolean{
    //find stack
    const first_free_id = this.find_first_free_entity_id(entity.id);
    if(first_free_id){
      const rem = this.inventory[first_free_id.y][first_free_id.x].add_to_stack(n);
      this.ui?.update_stack(first_free_id, this.inventory[first_free_id.y][first_free_id.x].stack_count, this.height);
      if(rem){
        //to do
        console.log("remaining")
      }
      //while(rem > 0){
      //  const first_free_id = this.find_first_free_entity_id(Inventory.id);
      //}
      this.#add_entity_counts(entity.id, n);
      return true;
    }
    if(this.available){
      this.inventory[this.available.y][this.available.x] = entity;
      this.ui?.set_bag_cell(this.available, entity, this.height);
      this.next_available();
      this.#add_entity_counts(entity.id, n);
      return true;
    }
    return false;
  }

  #add_entity_counts(id: Inventory.InventoryEntityId, n:number){
    if(this.entity_counts.has(id)){
      const new_count = this.entity_counts.get(id)! + n;
      if(new_count >=  0) this.entity_counts.set(id, new_count);
      return new_count;
    }
    if(n >= 0) this.entity_counts.set(id, n);
    return n;
  }
  add_entity_id(id: Inventory.InventoryEntityId, n:number=1){
    const first_free_id = this.find_first_free_entity_id(id);
    if(first_free_id){
      const rem = this.inventory[first_free_id.y][first_free_id.x].add_to_stack(n);
      this.ui?.update_stack(first_free_id, this.inventory[first_free_id.y][first_free_id.x].stack_count, this.height);
      if(rem){
        //to do
        console.log("remaining")
      }
      //while(rem > 0){
      //  const first_free_id = this.find_first_free_entity_id(Inventory.id);
      //}
      this.#add_entity_counts(id, n);
      return true;
    }
    if(this.available){
      const entity = AllInventory.entity_inventory_from_id(id);
      this.inventory[this.available.y][this.available.x] = entity;
      this.ui?.set_bag_cell(this.available, entity, this.height);
      this.next_available();
      this.#add_entity_counts(entity.id, n);
      return true;
    }
    return false;
  }
  remove_entity_id(id: Inventory.InventoryEntityId, n:number=1){
    const first_free = this.find_first_has_entity_id(id);
    if(first_free){
      const new_count = this.#add_entity_counts(id, -n);
      console.log(new_count);
      if(new_count > 0){
        this.inventory[first_free.y][first_free.x].add_to_stack(-n);
        this.ui?.update_stack(first_free, new_count, this.height);
      }else{
        this.ui?.clear_cell(first_free, this.height);
        this.add_blank_coord(first_free);
      }
    }

  }
  in_inventory(coord:Grid.GridCoordinate):boolean{
    return coord.x >= 0 && coord.y >= 0 && coord.x < this.width && coord.y < this.height;
  }
  is_available(coord:Grid.GridCoordinate):boolean{
    return this.inventory[coord.y][coord.x].is_blank();
  }
  next_available(): Grid.GridCoordinate | undefined{
    let next = this.next_coordinate();
    this.available = next;
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