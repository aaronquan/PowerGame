import * as Sprites from "../../graphics/sprites";
import * as Critters from "./critters";
import * as Wire from "./../../structures/power/wire";

export enum InventoryEntityType {
  Blank, Weapon, Critter, Wire
}

export enum InventoryEntityId{
  Blank,
  Wire,
  BlueCritter
}

export class InventoryEntity{
  type:InventoryEntityType;
  id: InventoryEntityId;
  icon_texture: string | undefined;
  stack_count: number;
  max_stack: number;
  constructor(type: InventoryEntityType, id: InventoryEntityId){
    this.type = type;
    this.id = id;
    this.icon_texture = undefined;
    this.stack_count = 1;
    this.max_stack = 1;
  }
  is_max_stack(): boolean{
    return this.stack_count === this.max_stack;
  }

  //returns remainder
  add_to_stack(n:number): number{
    this.stack_count += n;
    if(this.stack_count > this.max_stack){
      const diff = this.stack_count - this.max_stack;
      this.stack_count = this.max_stack;
      return diff;
    }
    return 0;
  }
  is_blank(): boolean{
    return this.type == InventoryEntityType.Blank;
  }
  static new_blank(): InventoryEntity{
    return new InventoryEntity(InventoryEntityType.Blank, InventoryEntityId.Blank);
  }
  new_icon(scene: Phaser.Scene, x: number, y: number): Sprites.DisplayImage | undefined{
    if(this.icon_texture){
      const new_image = new Sprites.DisplayImage(scene, x, y, this.icon_texture);
      return new_image;
    }
    return undefined;
  }
}

export function entity_inventory_from_id(id:InventoryEntityId): InventoryEntity{
  switch(id){
    case InventoryEntityId.Blank:
      return InventoryEntity.new_blank();
    case InventoryEntityId.BlueCritter:
      return new Critters.BlueCritterInventory();
    case InventoryEntityId.Wire:
      return new Wire.WireInventory();
  }
}