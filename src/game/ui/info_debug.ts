import * as Map from "./../map/gamemap";
import * as MapTiles from "./../map/maptiles";

export class InfoDebugUI{
  scene: Phaser.Scene;
  background: Phaser.GameObjects.Graphics;
  info_text: Phaser.GameObjects.Text;
  line2: Phaser.GameObjects.Text; 
  line3: Phaser.GameObjects.Text; 
  line4: Phaser.GameObjects.Text;

  line5: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene){ 
    this.scene = scene;
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0xffffff);
    this.background.fillRect(20, 20, 200, 200);

    this.info_text = this.scene.add.text(22, 22, "", {color: "black"});
    this.line2 = this.scene.add.text(22, 44, "", {color: "black"});
    this.line3 = this.scene.add.text(22, 66, "", {color: "black"});
    this.line4 = this.scene.add.text(22, 88, "", {color: "black"});

    this.line5 = this.scene.add.text(22, 110, "", {color: "black"});
  }
  
  refresh_display_info(info: Map.GridInfo| undefined){
    if(info == undefined){
      this.background.setVisible(false);
    }else{
      this.background.setVisible(true);
      if(info.x != undefined && info.y != undefined) this.info_text.setText("x: "+info.x.toString()+", y: "+info.y.toString());

      if(info.tile_type) this.line2.setText("Tile: "+MapTiles.tile_type_to_string(info.tile_type));
      this.line3.setText("Power: "+ (info.power ? "true" : "false"));
      this.line4.setText(info.structure_power ? "true" : "false");
    }
  }

  new_position(pos:Phaser.Math.Vector2){
    this.line5.setText(pos.x.toFixed()+" "+pos.y.toFixed());
  }
}