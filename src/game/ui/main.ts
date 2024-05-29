import { Player} from "../player/player";
import { WeaponHolder } from "../player/weapons";
import { PowerBarUI } from "./power_bar";
import { WeaponUI } from "./weapon_slots";

import * as Power from "./../structures/power/power";
import { InfoDebugUI } from "./info_debug";
import * as Map from "./../map/gamemap";
import { PlayerInventoryUI } from "./player_inventory";

import * as Inventory from "./../player/inventory";

export class GridTestUI extends Phaser.Scene{
  test_text!: Phaser.GameObjects.Text;
  power_bar_ui: PowerBarUI;
  weapon_ui: WeaponUI;
  info_debug: InfoDebugUI;

  player_inventory: PlayerInventoryUI;

  wires_text: Phaser.GameObjects.Text;
  constructor(){
    super('GridTestUI');
    this.weapon_ui = new WeaponUI(this);
    this.player_inventory = new PlayerInventoryUI(this);
  }
  create(){
    this.test_text = this.add.text(100, 100, 'Hello', {color: 'black'});
    this.power_bar_ui = new PowerBarUI(this);
    this.wires_text = this.add.text(500, 500, 'Wires', {color: 'white'});
    this.info_debug = new InfoDebugUI(this);
  }
  init_inventory(inventory: Inventory.PlayerInventory){
    console.log(this.player_inventory);
    this.player_inventory.init_inventory(inventory);
  }
  init_weapons(weapon_holder: WeaponHolder){
    this.weapon_ui.init(weapon_holder);
  }
  update_weapons(weapon_holder: WeaponHolder){
    //this.weapon_ui.update(weapon_holder);
  }
  update_player_stats(player:Player){
    this.wires_text.setText('Wires: '+player.n_wires.toString());
  }

  update_power_bar(power_bar:Power.PowerBar){
    this.power_bar_ui.update(power_bar);
  }
  update_display_info(info: Map.GridInfo | undefined){
    this.info_debug.refresh_display_info(info);
  }
}
