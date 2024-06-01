import * as Inventory from "./inventory";
import * as Critters from "./critters";
import * as Wire from "../../structures/power/wire";

export function entity_inventory_from_id(id:Inventory.InventoryEntityId): Inventory.InventoryEntity{
  switch(id){
    case Inventory.InventoryEntityId.Blank:
      return Inventory.InventoryEntity.new_blank();
    case Inventory.InventoryEntityId.BlueCritter:
      return new Critters.BlueCritterInventory();
    case Inventory.InventoryEntityId.Wire:
      return new Wire.WireInventory();
  }
}