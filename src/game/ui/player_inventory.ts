import * as Inventory from "./../player/inventory";
import * as Grid from "./../map/grid";
import * as Entity from "./../entity/entity";
import * as Sprites from "./../graphics/sprites";

export class BagEntityIcon{
  background: Phaser.GameObjects.Graphics;
  icon: Sprites.DisplayImage | undefined;
  stack_count_text: Phaser.GameObjects.Text;


  scene: Phaser.Scene;

  normal_cell_colour: number;
  hover_cell_colour: number;
  //width: number;
  //height: number;

  constructor(scene: Phaser.Scene, x: number, y: number, 
    width: number, height: number, visible: boolean){
    this.scene = scene;
    //this.icon = texture ? new Sprites.DisplayImage(scene, x, y, texture) : undefined;
    this.icon = undefined;
    this.normal_cell_colour = 0x333343;
    this.hover_cell_colour = 0x535359;
    //this.width = width; this.height = height;
    const icon_background = this.scene.add.graphics();
    icon_background.fillStyle(this.normal_cell_colour);
    icon_background.fillRect(x, y, width, height);
    this.background = icon_background;
    this.background.setVisible(visible);

    this.stack_count_text = scene.add.text(x, y, "", {color: "white", fontSize: 10});
    this.stack_count_text.setDepth(2);
  }
  is_none(): boolean{
    return this.icon == undefined;
  }
  set_entity(entity: Entity.InventoryEntity, x: number, y: number, visible: boolean){
    this.icon?.destroy();
    if(entity.icon_texture){
      this.icon = new Sprites.DisplayImage(this.scene, x, y, entity.icon_texture);
      this.icon.setDepth(1);
      this.icon.setVisible(visible);
      this.stack_count_text.setText(entity.stack_count.toString());
      this.stack_count_text.setVisible(visible);

    }
  }
  update_stack(n:number){
    this.stack_count_text.setText(n.toString());
  }
  set_position(x: number, y: number, slot_width:number, slot_height: number){
    this.stack_count_text.setX(x); this.stack_count_text.setY(y);
    this.icon?.setX(x+slot_width/2); this.icon?.setY(y+slot_height/2);
  }
  set_background_position(x: number, y: number){
    this.background.setX(x); this.background.setY(y);
  }
  empty_entity(){
    this.icon?.destroy();
    this.icon = undefined;
    this.stack_count_text.setText("");
  }
  hover_on(x: number, y: number, width: number, height: number){
    const new_bg = this.get_bag_icon_background(x, y, width, height, true);
    this.background?.destroy();
    this.background = new_bg;
  }
  hover_off(x: number, y: number, width: number, height: number){
    const new_bg = this.get_bag_icon_background(x, y, width, height, false);
    this.background?.destroy();
    this.background = new_bg;
  }
  get_bag_icon_background(x: number, y: number, width: number, height: number, hover: boolean): Phaser.GameObjects.Graphics{
    const bag_cell = this.scene.add.graphics();
    if(hover){
      bag_cell.fillStyle(this.hover_cell_colour);
    }else{
      bag_cell.fillStyle(this.normal_cell_colour);
    }
    bag_cell.fillRect(x, y, width, height);
    bag_cell.setDepth(0);
    return bag_cell;
  }
  set_visible(visible:boolean){
    this.background.setVisible(visible);
    this.icon?.setVisible(visible);
    this.stack_count_text.setVisible(visible);
  }
  destroy(){
    //this.icon?.destroy();
    //this.stack_count_text.setText("");
  }
}

export class PlayerInventoryUI{
  scene: Phaser.Scene;
  visible: boolean;

  slot_padding: number;
  slot_border_size: number;
  slot_width: number;
  slot_height: number;

  x:number; y:number;

  //bag_inventory_grid: Phaser.GameObjects.Graphics[];
  //bag_inventory_icons: (Sprites.DisplayImage | undefined)[];

  bag_entities: BagEntityIcon[];

  background: Phaser.GameObjects.Graphics;
  
  //inventory: Inventory.PlayerInventory;

  normal_cell_colour: number;
  hover_cell_colour: number;
  background_colour: number;

  hover_cell: Grid.GridCoordinate | undefined;
  selected_entity: Grid.GridCoordinate | undefined; // coord of selected bag_entity;

  constructor(scene: Phaser.Scene){
    this.scene = scene;
    this.visible = false;
    this.x = 250; this.y = 15;
    this.slot_padding = 4;
    this.slot_border_size = 6;
    this.slot_width = 32;
    this.slot_height = 32;

    //this.bag_inventory_grid = [];
    //this.bag_inventory_icons = [];
    this.bag_entities = [];

    this.normal_cell_colour = 0x333343;
    this.hover_cell_colour = 0x535359;

    this.background_colour = 0x10190c;

    this.hover_cell = undefined;

    this.selected_entity = undefined;
  }
  init_inventory(inventory: Inventory.PlayerInventory){
    //this.inventory = inventory;
    this.background = this.scene.add.graphics();
    const background_width = this.slot_width*inventory.width+this.slot_padding*(inventory.width-1)+this.slot_border_size*2;
    const background_height = this.slot_height*inventory.height+this.slot_padding*(inventory.height-1)+this.slot_border_size*2;
    this.background.fillStyle(this.background_colour);
    this.background.fillRect(this.x, this.y, background_width, background_height);

    let y = this.y+this.slot_border_size;
    for(let j = 0; j < inventory.height; ++j){
      let x = this.x+this.slot_border_size;
      for(let i = 0; i < inventory.width; ++i){
        //const bag_inventory_background = this.scene.add.graphics();
        //bag_inventory_background.fillStyle(this.normal_cell_colour);
        //bag_inventory_background.fillRect(x, y, this.slot_width, this.slot_height);
        //this.bag_inventory_grid.push(bag_inventory_background);

        const empty_slot = new BagEntityIcon(this.scene, x, y, this.slot_width, this.slot_height, false);
        this.bag_entities.push(empty_slot);

        x += this.slot_padding+this.slot_width;

        //this.bag_inventory_icons.push(undefined);
      }
      y += this.slot_padding+this.slot_height;
    }

    this.set_visible(this.visible);
  }
  set_bag_cell(coord: Grid.GridCoordinate, entity: Entity.InventoryEntity, height: number){
    console.log("setting cell: "+coord.x.toString()+" "+ coord.y.toString())
    const position = this.get_cell_position_from_coords(coord, true);
    //const icon = entity.new_icon(this.scene, position.x, position.y);
    //icon?.setVisible(this.visible);
    //icon?.setDepth(1);
    const id = this.get_grid_index(coord, height);
    this.bag_entities[id]?.destroy();
    this.bag_entities[id].set_entity(entity, position.x, position.y, this.visible);

    //this.bag_inventory_icons[id]?.destroy();
    //this.bag_inventory_icons[id] = icon;
  }
  mouse_down(coord: Grid.GridCoordinate | undefined, height: number){
    if(coord){
      const id = this.get_grid_index(coord, height);
      if(!this.bag_entities[id].is_none()){
        //this.bag_entities[id]
        this.selected_entity = coord;
      }
    }
  }
  mouse_up(coord: Grid.GridCoordinate | undefined, height: number): Inventory.InventoryAction{
    const action:Inventory.InventoryAction = {};
    if(this.selected_entity !== undefined){
      const id = this.get_grid_index(this.selected_entity, height);
      if(coord && !Grid.grid_coordinate_equals(this.selected_entity, coord)){
        //this.bag_entities[id].destroy();
        const new_id = this.get_grid_index(coord, height);
        const temp = this.bag_entities[id];
        this.bag_entities[id] = this.bag_entities[new_id];
        this.bag_entities[new_id] = temp;

        const old_id_position = this.get_cell_position_from_coords(this.selected_entity, false);
        this.bag_entities[id].hover_off(old_id_position.x, old_id_position.y, this.slot_width, this.slot_height);
        this.bag_entities[id].set_position(old_id_position.x, old_id_position.y, this.slot_width, this.slot_height);

        //const new_centre_position = this.get_cell_position_from_coords(coord, true);
        const new_position = this.get_cell_position_from_coords(coord, false);
        this.bag_entities[new_id].set_position(new_position.x, new_position.y, this.slot_width, this.slot_height);

        action.swap = {new: this.selected_entity, old: coord};
      }else{
        const position = this.get_cell_position_from_coords(this.selected_entity, false);
        //const centre_position = this.get_cell_position_from_coords(this.selected_entity, true);
        this.bag_entities[id].set_position(position.x, position.y, this.slot_width, this.slot_height);
      }
    }
    this.selected_entity = undefined;
    return action;
  }
  mouse_over(position: Phaser.Math.Vector2 | Phaser.Input.Pointer, bag_width: number, bag_height: number): Grid.GridCoordinate | undefined{
    if(!this.visible) return undefined;

    if(this.selected_entity !== undefined){
      const id = this.get_grid_index(this.selected_entity, bag_height);
      const new_pos = new Phaser.Math.Vector2(position.x - this.slot_width/2, position.y - this.slot_height/2);
      this.bag_entities[id].set_position(new_pos.x, new_pos.y, this.slot_width, this.slot_height);
    }
    const close_x = this.x+this.slot_border_size;
    const far_x = this.x+this.slot_padding*(bag_width-1)+this.slot_width*bag_width+this.slot_border_size;
    const in_x = position.x > close_x && position.x < far_x;
    const close_y = this.y+this.slot_border_size;
    const far_y = this.y+this.slot_padding*(bag_height-1)+this.slot_height*bag_height+this.slot_border_size;
    const in_y = position.y > close_y && position.y < far_y;
    if(in_x && in_y){
      const x = position.x - close_x;
      const y = position.y - close_y;
      if(x % (this.slot_width+this.slot_padding) > this.slot_width){
        return undefined;
      }
      if(y % (this.slot_height+this.slot_padding) > this.slot_height){
        return undefined;
      }
      const gcX = x/(this.slot_width+this.slot_padding);
      const gcY = y/(this.slot_height+this.slot_padding);
      return {x: Math.floor(gcX), y: Math.floor(gcY)};
    }


    return undefined;
  }
  get_cell_position_from_coords(coord: Grid.GridCoordinate, center: boolean=false): Phaser.Math.Vector2{
    const x = this.x+this.slot_border_size+this.slot_width*coord.x+this.slot_padding*(coord.x);
    const y = this.y+this.slot_border_size+this.slot_height*coord.y+this.slot_padding*(coord.y);
    if(center){
      return new Phaser.Math.Vector2(x+this.slot_width/2, y+this.slot_height/2);
    }
    return new Phaser.Math.Vector2(x, y);
  }
  get_bag_cell(coord: Grid.GridCoordinate, hover: boolean): Phaser.GameObjects.Graphics{
    const bag_cell = this.scene.add.graphics();
    const x = this.x+this.slot_border_size+this.slot_width*coord.x+this.slot_padding*(coord.x);
    const y = this.y+this.slot_border_size+this.slot_height*coord.y+this.slot_padding*(coord.y);
    if(hover){
      bag_cell.fillStyle(this.hover_cell_colour);
    }else{
      bag_cell.fillStyle(this.normal_cell_colour);
    }
    bag_cell.fillRect(x, y, this.slot_width, this.slot_height);
    bag_cell.setDepth(0);
    return bag_cell;
  }
  hover_on(cell: Grid.GridCoordinate | undefined, height: number){
    if(!this.visible) return;
    if(this.hover_cell){
      if(cell == undefined || (cell && !Grid.grid_coordinate_equals(cell, this.hover_cell))){
        const id = this.get_grid_index(this.hover_cell, height);
        //this.bag_inventory_grid[cid].destroy();
        //const new_cell = this.get_bag_cell(this.hover_cell, false);
        //this.bag_inventory_grid[cid] = new_cell;
        const cell_position = this.get_cell_position_from_coords(this.hover_cell);
        this.bag_entities[id].hover_off(cell_position.x, cell_position.y, this.slot_width, this.slot_height);
      }
    }
    if(cell){
      const id = this.get_grid_index(cell, height);
      //this.bag_inventory_grid[id].destroy();
      //const new_cell = this.get_bag_cell(cell, true);
      //this.bag_inventory_grid[id] = new_cell;

      const cell_position = this.get_cell_position_from_coords(cell);
      this.bag_entities[id].hover_on(cell_position.x, cell_position.y, this.slot_width, this.slot_height);
    }
    this.hover_cell = cell;

  }
  update_stack(coord: Grid.GridCoordinate, n:number, height:number){
    const id = this.get_grid_index(coord, height);
    this.bag_entities[id].update_stack(n);
  }
  show(){
    this.visible = true;
    this.set_visible(true);
  }
  hide(){
    this.visible = false;
    this.set_visible(false);
  }
  set_visible(vis: boolean){
    this.background.setVisible(vis);
    /*for(const cell of this.bag_inventory_grid){
      cell.setVisible(vis);
    }
    for(const icon of this.bag_inventory_icons){
      icon?.setVisible(vis);
    }*/
    for(const entity of this.bag_entities){
      entity?.set_visible(vis);
    }
  }
  toggle_visible(){
    if(this.visible){
      this.hide();
    }else{
      this.show();
    }
  }
  get_grid_index(cell: Grid.GridCoordinate, height: number): number{
    return cell.x + cell.y*height;
  }
}