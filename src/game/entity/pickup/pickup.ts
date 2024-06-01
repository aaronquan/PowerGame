import * as Sprites from "./../../graphics/sprites";
import * as Player from "./../../player/player";
import * as Inventory from "./../inventory/inventory";
import * as AllInventory from "./../inventory/all_inventory";

export enum PickUpId{
  None, Wire
}

export class PickUpEntity extends Sprites.DisplayImage{
  static player_range:number = 50;
  static player_range_squared: number = this.player_range*this.player_range;
  static pickup_range: number = 100;
  static pickup_range_squared: number = PickUpEntity.pickup_range*PickUpEntity.pickup_range;
  
  circle: Sprites.DisplayImage;
  id: PickUpId;
  count: number;
  constructor(scene: Phaser.Scene, x: number, y: number, t:string){
    super(scene, x, y, t);
    this.circle = new Sprites.DisplayImage(scene, x, y, 'circle32');
    this.circle.setDepth(5);
    this.setDepth(6);
    this.id = PickUpId.None
    this.count = 1;
  }

  player_collision(player: Player.Player):boolean{
    const vec = new Phaser.Math.Vector2(this.x-player.x, this.y-player.y);
    return vec.lengthSq() < PickUpEntity.player_range_squared;
  }
  pick_up_collision(player: Player.Player):boolean{
    const vec = new Phaser.Math.Vector2(this.x-player.x, this.y-player.y);
    return vec.lengthSq() < PickUpEntity.pickup_range_squared;
  }
  destroy(){
    super.destroy();
    this.circle.destroy();
  }
  get_inventory_entity(): Inventory.InventoryEntity{
    return AllInventory.entity_inventory_from_id(Inventory.InventoryEntityId.Blank);
  }
  get_inventory_entity_id(): Inventory.InventoryEntityId{
    return Inventory.InventoryEntityId.Blank;
  }
}

export class WirePickUp extends PickUpEntity{
  constructor(scene: Phaser.Scene, x: number, y: number){
    super(scene, x,  y, 'wireplacer');
    this.id = PickUpId.Wire;
    this.circle.setDepth(5);
  }
  get_inventory_entity(): Inventory.InventoryEntity{
    return AllInventory.entity_inventory_from_id(Inventory.InventoryEntityId.Wire);
  }
  get_inventory_entity_id(): Inventory.InventoryEntityId{
    return Inventory.InventoryEntityId.Wire;
  }
}

export class PickUpCollection{
  pickups: Map<number, PickUpEntity>;
  current_id: number;
  constructor(){
    this.pickups = new Map();
    this.current_id = 0;
  }
  add_pickup_id(id: PickUpId, scene:Phaser.Scene, x:number, y:number){
    const pickup = pick_up_from_id(id, scene, x, y);
    const p_id = this.current_id;
    this.pickups.set(p_id, pickup);
    this.current_id++;
    return p_id;
  }
  destroy_pid(pid: number){
    this.pickups.get(pid)?.destroy();
    this.pickups.delete(pid);
  }
  update_player(player: Player.Player){
    for(const [id, pickup] of this.pickups){
      if(pickup.player_collision(player)){
        console.log(id);
        player.add_inventory(pickup.get_inventory_entity_id(), pickup.count);
        this.destroy_pid(id);
      }
    }
  }
}

export function pick_up_from_id(id: PickUpId, scene:Phaser.Scene, x: number, y: number): PickUpEntity{
  switch(id){
    case PickUpId.Wire:
      return new WirePickUp(scene, x, y);
    case PickUpId.None:
      return new PickUpEntity(scene, x, y, "");
  }
}