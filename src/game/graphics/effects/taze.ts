import * as Line from "./../lines";

export function simple_taze(scene: Phaser.Scene, start:Phaser.Math.Vector2, end:Phaser.Math.Vector2): Phaser.GameObjects.Graphics{
  //const end_point = this.get_effect_end_point(angle);
  //const start_point = new Phaser.Math.Vector2(this.x, this.y);
  //const length = 
  const new_line = new Line.RandomLinePath(start, end, 10, 4);
  const path = new_line.generate_path();
  return Line.drawCurvePath(scene, path, 0x0000ff, 1);
}