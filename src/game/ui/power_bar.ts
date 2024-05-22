import * as Power from "./../structures/power/power";


export class PowerBarUI{
  scene: Phaser.Scene;

  power_bar_location: Phaser.Math.Vector2;
  power_bar_width: number;
  power_bar_height: number;

  power_bar_text: Phaser.GameObjects.Text;
  power_bar_background!: Phaser.GameObjects.Graphics;
  power_bar_background_outline!: Phaser.GameObjects.Graphics;
  power_bar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene){
    this.scene = scene;
    this.power_bar_location = new Phaser.Math.Vector2(550, 550);
    this.power_bar_width = 200;
    this.power_bar_height = 40;

    this.power_bar_background = this.scene.add.graphics();
    this.power_bar_background.fillStyle(0x000000);
    this.power_bar_background.fillRect(this.power_bar_location.x, this.power_bar_location.y, 
      this.power_bar_width, this.power_bar_height);

    this.power_bar_background_outline = this.scene.add.graphics();
    this.power_bar_background_outline.lineStyle(2, 0xffffff);
    this.power_bar_background_outline.strokeRect(this.power_bar_location.x, this.power_bar_location.y, 
      this.power_bar_width, this.power_bar_height);
    

    this.power_bar = this.scene.add.graphics();
    this.power_bar.fillStyle(0x0000ff);
    this.power_bar.fillRect(this.power_bar_location.x, this.power_bar_location.y, 
      this.power_bar_width, this.power_bar_height);

    this.power_bar_text = this.scene.add.text(this.power_bar_location.x, 
      this.power_bar_location.y, 'Loading');
  }
  update(power_bar:Power.PowerBar){
    this.power_bar.destroy();
    const width = 200*power_bar.ratio();
    const inv_width = 200 - width;

    this.power_bar = this.scene.add.graphics();
    this.power_bar.fillStyle(0x0000ff);
    this.power_bar.fillRect(this.power_bar_location.x+inv_width, this.power_bar_location.y, width, this.power_bar_height);

    //this.power_bar_text.destroy();
    this.power_bar_text.setText(power_bar.current_power.toFixed(1)+'/'+power_bar.power_capacity);
    this.power_bar_text.setDepth(1);
  }
}