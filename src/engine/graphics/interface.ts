

export interface HealthBar{
  scene: Phaser.Scene;
  visible: boolean;
  background: Phaser.GameObjects.Graphics;
  health_bar: Phaser.GameObjects.Graphics;

  set_health_bar_dimensions:(width:number, height:number) => void;
  show:() => void;
  hide:() => void;
  update_position:(x: number, y: number) => void;
}

export type HealthBarObjectAttachment = {
  relative_position: Phaser.Math.Vector2;
  health_bar: HealthBar;
}

export class GeneralHealthBar implements HealthBar{
    scene: Phaser.Scene;
    visible: boolean;
    background: Phaser.GameObjects.Graphics;
    health_bar: Phaser.GameObjects.Graphics;
    relative_position: Phaser.Math.Vector2;
  
    private static width: number = 30; 
    private static height: number = 12;
    private static half_width: number = GeneralHealthBar.width/2; 
    private static half_height: number = GeneralHealthBar.height/2;

    constructor(scene:Phaser.Scene){
      this.scene = scene;

      this.relative_position = new Phaser.Math.Vector2();
      
      this.background = scene.add.graphics();
      this.background.fillStyle(0xff0000);
      this.background.lineStyle(3, 0xffffff);
      this.background.fillRect(-GeneralHealthBar.half_width, -GeneralHealthBar.half_height, GeneralHealthBar.width, GeneralHealthBar.height);
      this.background.strokeRect(-GeneralHealthBar.half_width, -GeneralHealthBar.half_height, GeneralHealthBar.width, GeneralHealthBar.height);
      this.health_bar = scene.add.graphics();
      this.health_bar.fillStyle(0x00ff00);
      this.health_bar.fillRect(-GeneralHealthBar.half_width, -GeneralHealthBar.half_height, GeneralHealthBar.width, GeneralHealthBar.height);
      
      this.visible = false;
      this.hide();
    }
    static set_health_bar_dimensions(width:number, height:number){
      GeneralHealthBar.width = width;
      GeneralHealthBar.height = height;
      GeneralHealthBar.half_width = GeneralHealthBar.width/2;
      GeneralHealthBar.half_height = GeneralHealthBar.height/2;
    }

    set_health_bar_dimensions(width:number, height:number){
      GeneralHealthBar.width = width;
      GeneralHealthBar.height = height;
      GeneralHealthBar.half_width = GeneralHealthBar.width/2;
      GeneralHealthBar.half_height = GeneralHealthBar.height/2;
    }

    hide(){
      this.visible = false;
      this.background.setVisible(false);
      this.health_bar.setVisible(false);
    }
    show(){
      this.visible = true;
      this.background.setVisible(true);
      this.health_bar.setVisible(true);
    }
    destroy(){
      this.background.destroy();
      this.health_bar.destroy();
    }
    update_position(x: number, y: number){
      this.background.setX(x+this.relative_position.x); this.background.setY(y+this.relative_position.y);
      this.health_bar.setX(x+this.relative_position.x); this.health_bar.setY(y+this.relative_position.y);
    }
    update_health(max_hp: number, hp: number){
      const ratio = hp/max_hp;
      this.health_bar.destroy();
  
      this.health_bar = this.scene.add.graphics();
      this.health_bar.fillStyle(0x00ff00);
      this.health_bar.fillRect(-GeneralHealthBar.half_width, -GeneralHealthBar.half_height, GeneralHealthBar.width*ratio, GeneralHealthBar.height);
      this.health_bar.setX(this.background.x); 
      this.health_bar.setY(this.background.y);
      this.health_bar.setVisible(this.visible)
    }
  }