



export function draw_circle_graphics(scene: Phaser.Scene, circle: Phaser.Geom.Circle, 
  fill?: Phaser.Display.Color, outline_colour?: Phaser.Display.Color, 
  line_width:number=1): Phaser.GameObjects.Graphics{
  const new_graphics = scene.add.graphics();
  if(fill !== undefined){
    new_graphics.fillStyle(fill.color, fill.alphaGL);
    new_graphics.fillCircle(circle.x, circle.y, circle.radius);
  }
  if(outline_colour !== undefined && line_width){
    new_graphics.lineStyle(line_width, outline_colour.color, outline_colour.alphaGL);
    new_graphics.strokeCircle(circle.x, circle.y, circle.radius);
  }

  return new_graphics;
}

export function draw_circle_shape(scene: Phaser.Scene, circle: Phaser.Geom.Circle, 
  fill?: Phaser.Display.Color, outline_colour?: Phaser.Display.Color, 
  line_width:number=1): Phaser.GameObjects.Arc
{
  const new_shape = scene.add.circle(circle.x, circle.y, circle.radius, fill?.color, fill?.alphaGL);
  if(outline_colour !== undefined && line_width){
    new_shape.setStrokeStyle(line_width, outline_colour.color, outline_colour.alphaGL);
  }
  return new_shape;
}