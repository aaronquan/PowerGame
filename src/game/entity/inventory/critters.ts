import * as Inventory from "./inventory";
import * as Critter from "./../../enemies/critter";

export class CritterInventory extends Inventory.InventoryEntity{
  constructor(texture: string|undefined, id:Inventory.InventoryEntityId){
    super(Inventory.InventoryEntityType.Critter, id);
    this.icon_texture = texture;
    this.max_stack = 5;
  }
}

export class BlueCritterInventory extends CritterInventory{
  constructor(){
    super(Critter.BlueCritter.texture_name, Inventory.InventoryEntityId.BlueCritter);
  }
}