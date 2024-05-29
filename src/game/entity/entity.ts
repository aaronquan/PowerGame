import * as Sprites from "../graphics/sprites";
import * as InventoryUI from "./../ui/player_inventory";

export class LivingMovingEntity extends Sprites.DisplayPhysicsSprite{
  max_health: number;
  health: number;
  health_bar: HealthBar;
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    this.max_health = 10;
    this.health = 10;
    //this.show_health_bar = false;
    this.health_bar = new HealthBar(this.scene);
  }
  die(){
    this.destroy();
    this.health_bar.destroy();
    console.log("destroy health bar");
  }
  take_damage(damage:number):boolean{
    this.health -= damage;
    if(this.health < 0){
      return true;
    }
    this.health_bar.update_health(this.max_health, this.health);
    return false;
  }
  //show_health_bar(){

  //}
  display_health_bar(){
    this.health_bar.visible = true;
    this.health_bar.show();
  }
  hide_health_bar(){
    this.health_bar.visible = false;
    this.health_bar.hide();
  }
  toggle_health_bar(){
    this.health_bar.visible = !this.health_bar.visible;
    if(!this.health_bar.visible){
      this.display_health_bar();
    }else{
      this.hide_health_bar();
    }
  }
}

//for structures
export class StaticDestroyableEntity extends Sprites.DisplaySprite{

}

class HealthBar{
  scene: Phaser.Scene;
  visible: boolean;
  background: Phaser.GameObjects.Graphics;
  health_bar: Phaser.GameObjects.Graphics;

  width: number; height: number;

  constructor(scene:Phaser.Scene){
    this.scene = scene;
    this.width = 30; this.height = 12;
    this.background = scene.add.graphics();
    this.background.fillStyle(0xff0000);
    this.background.lineStyle(3, 0xffffff);
    this.background.fillRect(0, 0, this.width, this.height);
    this.background.strokeRect(0, 0, this.width, this.height);
    this.health_bar = scene.add.graphics();
    this.health_bar.fillStyle(0x00ff00);
    this.health_bar.fillRect(0, 0, this.width, this.height);
    
    this.visible = false;
    this.hide();
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
    this.background.setX(x); this.background.setY(y);
    this.health_bar.setX(x); this.health_bar.setY(y);
  }
  update_health(max_hp: number, hp: number){
    const ratio = hp/max_hp;
    this.health_bar.destroy();

    this.health_bar = this.scene.add.graphics();
    this.health_bar.fillStyle(0x00ff00);
    this.health_bar.fillRect(0, 0, this.width*ratio, this.height);
    this.health_bar.setX(this.background.x); 
    this.health_bar.setY(this.background.y);
    this.health_bar.setVisible(this.visible)
  }
}
