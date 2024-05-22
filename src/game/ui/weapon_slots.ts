import * as Weapons from "../player/weapons";


export class WeaponUI {
  scene: Phaser.Scene;
  weapon_row_slot: Phaser.GameObjects.Graphics[];
  weapon_row_icons: (Phaser.GameObjects.Image | undefined)[];
  icon_width: number;

  position: Phaser.Math.Vector2;
  active_weapon: number;
  constructor(scene: Phaser.Scene){ 
    this.scene = scene;
    this.weapon_row_slot = [];
    this.weapon_row_icons = [];

    this.position = new Phaser.Math.Vector2(200, 500);
    
    this.icon_width = 50;

    this.active_weapon = 0;
  }
  init(weapons: Weapons.WeaponHolder){
    for(let i = 0; i < weapons.slots; i++){
      const x = this.position.x+i*this.icon_width;
      const y = this.position.y;
      const slot = this.new_weapon_slot(i, i == 0);
      this.weapon_row_slot.push(slot);
      let icon:(Phaser.GameObjects.Image | undefined) = undefined;
      if(weapons.weapons[i] && weapons.weapons[i]?.texture){
        const half_icon = this.icon_width/2;
        icon = this.scene.add.image(x+half_icon, y+half_icon, weapons.weapons[i]!.texture);
        const scale = this.icon_width / Math.max(weapons.weapons[i]!.width,weapons.weapons[i]!.height);
        icon.setScale(scale,scale);
        icon.setDepth(1);
      }
      this.weapon_row_icons.push(icon);
    }
  }
  set_active(slot_n: number){
    if(slot_n !== this.active_weapon){
      const mini_slot = this.new_weapon_slot(this.active_weapon, false);
      this.weapon_row_slot[this.active_weapon] = mini_slot;

      this.weapon_row_slot[slot_n]?.destroy();
      const new_slot = this.new_weapon_slot(slot_n, true);
      this.weapon_row_slot[slot_n] = new_slot;
      this.active_weapon = slot_n;
    }
  }
  new_weapon_slot(slot_n: number, active:boolean){
    this.weapon_row_slot[slot_n]?.destroy();
    const slot = this.scene.add.graphics();
    const x = this.position.x+slot_n*this.icon_width;
    const y = this.position.y;
    slot.fillStyle(0xbbf3ff);
    slot.fillRect(x, y, this.icon_width, this.icon_width);
    slot.lineStyle(active ? 4 : 2, 0xf2ce00);
    slot.strokeRect(this.position.x+slot_n*this.icon_width, this.position.y, this.icon_width, this.icon_width);
    return slot;
  }
  set_weapon_slot(slot: number, weapon:Weapons.Weapon){
    //todo  not implemented in game yet
  }
}