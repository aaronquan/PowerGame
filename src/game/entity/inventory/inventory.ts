import * as Sprites from "../../graphics/sprites";

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
  is_same_id(entity: InventoryEntity): boolean{
    return this.id == entity.id;
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
    return new BlankInventoryEntity();
  }
  new_icon(scene: Phaser.Scene, x: number, y: number): Sprites.DisplayImage | undefined{
    if(this.icon_texture){
      const new_image = new Sprites.DisplayImage(scene, x, y, this.icon_texture);
      return new_image;
    }
    return undefined;
  }
  can_add_stack(n:number): boolean{
    return n+this.stack_count <= this.max_stack;
  }
  is_void():boolean{
    return this.stack_count <= 0;
  }
  remove_stack(n: number):boolean{
    this.stack_count -= n;
    return this.stack_count <= 0
  }
}

export class BlankInventoryEntity extends InventoryEntity{
  constructor(){
    super(InventoryEntityType.Blank, InventoryEntityId.Blank);
    this.max_stack = 0;
    this.stack_count = 0;
  }
}