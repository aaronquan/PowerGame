import * as Inventory from "./../player/inventory";

export class PlayerInventoryUI{
  scene: Phaser.Scene;
  visible: boolean;

  slot_padding: number;
  slot_border_size: number;
  slot_width: number;
  slot_height: number;

  x:number; y:number;

  bag_inventory_grid: Phaser.GameObjects.Graphics[];
  background: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene){
    this.scene = scene;
    this.visible = false;
    this.x = 200; this.y = 200;
    this.slot_padding = 4;
    this.slot_border_size = 6;
    this.slot_width = 30;
    this.slot_height = 30;

    this.bag_inventory_grid = [];

    this.background = scene.add.graphics();
  }
  init_inventory(inventory: Inventory.PlayerInventory){
    this.background = this.scene.add.graphics();
    const background_width = this.slot_width*inventory.width+this.slot_padding*(inventory.width-1)+this.slot_border_size*2;
    const background_height = this.slot_height*inventory.height+this.slot_padding*(inventory.height-1)+this.slot_border_size*2;
    this.background.fillStyle(0x000000);
    this.background.fillRect(200, 200, background_width, background_height);

    let y = this.y+this.slot_border_size;
    for(let j = 0; j < inventory.height; ++j){
      let x = this.x+this.slot_border_size;
      for(let i = 0; i < inventory.width; ++i){
        const bag_inventory_background = this.scene.add.graphics();
        bag_inventory_background.fillStyle(0x333343);
        bag_inventory_background.fillRect(x, y, this.slot_width, this.slot_height);
        this.bag_inventory_grid.push(bag_inventory_background);
        x += this.slot_padding+this.slot_width;
      }
      y += this.slot_padding+this.slot_height;
    }
  }
  show(){
    this.visible = true;
  }
  hide(){
    this.visible = false;
  }

  toggle_visible(){
    this.visible = !this.visible;
  }
}