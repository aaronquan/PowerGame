export class RandomLinePath{
  detail:number;
  p1:Phaser.Math.Vector2;
  p2:Phaser.Math.Vector2;
  displacement:number;
  constructor(p1:Phaser.Math.Vector2, p2:Phaser.Math.Vector2, disp:number, detail:number){
    this.p1 = p1;
    this.p2 = p2;
    this.displacement = disp;
    this.detail = detail;
  }
  generate_path():Phaser.Curves.Path{
    const rec = this.recStep(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.displacement, []);
    const path = new Phaser.Curves.Path();
    for(let i = 0; i < rec.length; i++){
      path.add(rec[i]);
    }
    return path;
  }
  recStep(x1:number, y1:number, x2:number, y2:number, disp:number, path:Phaser.Curves.Line[]):Phaser.Curves.Line[]{
    if(disp < this.detail){
      const new_line = [...path];
      new_line.push(new Phaser.Curves.Line(new Phaser.Math.Vector2(x1, y1), new Phaser.Math.Vector2(x2, y2)));
      return new_line;
    }else{
      let midX = (x1+x2)/2;
      let midY = (y1+y2)/2;
      midX = midX + (Math.random()-0.5) * disp;
      midY = midY + (Math.random()-0.5) * disp;
      return this.recStep(x1, y1, midX, midY, disp/2, path).concat(this.recStep(midX, midY, x2, y2, disp/2, path));
    }
  }
}

export function drawCurvePath(scene:Phaser.Scene, path: Phaser.Curves.Path, colour:number=0xff0000, width:number=2, alpha:number=1){
  const graphics = scene.add.graphics();
  graphics.lineStyle(width, colour, alpha);
  if(path.curves.length >= 2){
    graphics.beginPath();
    const first = path.curves[0] as Phaser.Curves.Line;
    graphics.moveTo(first.p0.x, first.p0.y);
    graphics.lineTo(first.p1.x, first.p1.y);
    for(let i = 1; i < path.curves.length; i++){
      const line = path.curves[i] as Phaser.Curves.Line;
      graphics.lineTo(line.p1.x, line.p1.y);
    }
    graphics.strokePath();
    graphics.closePath();
  }
  return graphics;

}