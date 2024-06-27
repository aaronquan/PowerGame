import { Collision } from "matter";
import * as Display from "./../display";
import * as GeomGraphics from "./../graphics/geom";

export enum CollisionType{
  Circle, Line, Point, Triangle, AxisRectangle, Rectangle
}

export enum DebugState{
  Default, Collision
}

const debug = process.env.NODE_ENV ? true : false;

export const debug_collision_styles = {
  default_fill: new Phaser.Display.Color(255, 0, 0, 100),
  default_outline: new Phaser.Display.Color(255, 0, 0),
  collision_fill: new Phaser.Display.Color(0, 255, 0, 100),
  collision_outline: new Phaser.Display.Color(0, 255, 0),
  outline_line_width: 2,
}

type GeneralCollisionObject = {
  triangle?: Phaser.Geom.Triangle;
  circle?: Phaser.Geom.Circle;
  line?: Phaser.Geom.Line;
  point?: Phaser.Geom.Point;
  axis_rectangle?: Phaser.Geom.Rectangle;
  rectangle?: CollisionRectangle;
};

export class CollisionObjectFactory{
  
  static create_static_collision_circle(x:number, y: number, radius:number, scene?:Phaser.Scene): StaticCircleCollisionObject{
    //console.log(x);
    const new_circle = new StaticCircleCollisionObject(x, y, radius);
    if(scene && debug) new_circle.add_debug(scene);
    return new_circle;
  }
  static create_static_collision_axis_rectangle(
    x:number, y: number, width: number, height: number, scene?:Phaser.Scene
  ): StaticAxisRectangleCollisionObject{
    const new_rectangle = new StaticAxisRectangleCollisionObject(x, y, width, height)
    if(scene && debug) new_rectangle.add_debug(scene);
    return new_rectangle;
  }

  static create_static_collision_triangle(x:number, y: number, x1: number, y1: number, 
    x2: number, y2: number, x3: number, y3: number, scene?:Phaser.Scene
  ): StaticTriangleCollisionObject{
    const new_triangle = new StaticTriangleCollisionObject(x, y, x1, y1, x2, y2, x3, y3);
    if(scene && debug) new_triangle.add_debug(scene);
    return new_triangle;
  }

  static create_collision_circle(x:number, y: number, radius:number, scene?:Phaser.Scene): CircleCollisionObject{
    //console.log(x);
    const new_circle = new CircleCollisionObject(x, y, radius);
    if(scene && debug) new_circle.add_debug(scene);
    return new_circle;
  }
  static create_collision_axis_rectangle(
    x:number, y: number, width: number, height: number, scene?:Phaser.Scene
  ): AxisRectangleCollisionObject{
    const new_rectangle = new AxisRectangleCollisionObject(x, y, width, height)
    if(scene && debug) new_rectangle.add_debug(scene);
    return new_rectangle;
  }

  static create_collision_triangle(x:number, y: number, x1: number, y1: number, 
    x2: number, y2: number, x3: number, y3: number, scene?:Phaser.Scene
  ): TriangleCollisionObject{
    const new_triangle = new TriangleCollisionObject(x, y, x1, y1, x2, y2, x3, y3);
    if(scene && debug) new_triangle.add_debug(scene);
    return new_triangle;
  }

  static create_collision_rectangle(
    x:number, y: number, width: number, height: number, scene?:Phaser.Scene
  ): RectangleCollisionObject{
    const new_rectangle = new RectangleCollisionObject(x, y, width, height)
    if(scene && debug) new_rectangle.add_debug(scene);
    return new_rectangle;
  }
}



export interface StaticCollisionObject{
  readonly type: CollisionType;
  //object: GeneralCollisionObject;
  /* ref
  triangle?: Phaser.Geom.Triangle;
  circle?: CollisionCircle;
  line?: Phaser.Geom.Line;
  point?: Phaser.Geom.Point;
  rectangle?: Phaser.Geom.Rectangle;*/

  //add_debug(scene:Phaser.Scene): void;
  set_debug_state(state:DebugState): void;
  get_geom_shape(): GeneralCollisionObject;
  is_collision(object: StaticCollisionObject): boolean;
  is_point_collision(x:number, y: number): boolean;
  //get_type(): CollisionType;
  //get_circle():
}


export interface CollisionObject extends StaticCollisionObject{
  move(velocity: Phaser.Math.Vector2): void;
  rotate(angle: number): void;
  move_to(x:number, y:number): void;
}

class StaticCircleCollisionObject implements StaticCollisionObject{
  readonly type: CollisionType;
  protected circle: CollisionCircle;
  constructor(x:number, y: number, radius:number){
    this.type = CollisionType.Circle;
    this.circle = new CollisionCircle(x, y, radius);
  }
  add_debug(scene: Phaser.Scene): void{
    this.circle.add_debug(scene);
  };
  set_debug_state(state: DebugState): void {
    this.circle.set_debug_state(state);
  }
  get_geom_shape(): GeneralCollisionObject {
    return {circle: this.circle};
  }
  is_collision(object: CollisionObject): boolean{
    //object.get_geom_shape();
    return is_circle_object_collision(this.circle, object);
  }
  is_point_collision(x:number, y: number): boolean{
    return this.circle.contains(x, y);
  }
}

class CircleCollisionObject extends StaticCircleCollisionObject implements CollisionObject{
  move(velocity: Phaser.Math.Vector2): void{
    this.circle.move(velocity);
  };
  rotate(angle: number): void{};
  move_to(x:number, y:number): void{
    this.circle.move_to(x, y);
  }
}

class StaticAxisRectangleCollisionObject implements StaticCollisionObject{
  readonly type: CollisionType;
  protected rectangle: AxisCollisionRectangle;
  constructor(x:number, y: number, width: number, height: number){
    this.type = CollisionType.AxisRectangle;
    this.rectangle = new AxisCollisionRectangle(x, y, width, height);
  }
  add_debug(scene: Phaser.Scene): void{
    this.rectangle.add_debug(scene);
  };
  set_debug_state(state: DebugState): void {
    this.rectangle.set_debug_state(state);
  }
  get_geom_shape(): GeneralCollisionObject {
    return {axis_rectangle: this.rectangle}
  }
  is_collision(object: CollisionObject): boolean{
    return is_axis_rect_object_collision(this.rectangle, object);
  }
  is_point_collision(x:number, y: number): boolean{
    return this.rectangle.contains(x, y);
  }
}

class AxisRectangleCollisionObject extends StaticAxisRectangleCollisionObject implements CollisionObject{
  move(velocity: Phaser.Math.Vector2){
    this.rectangle.move(velocity);
  }
  rotate(angle: number): void{};
  move_to(x:number, y:number): void{
    this.rectangle.move_to(x, y);
  }
}

class StaticTriangleCollisionObject implements StaticCollisionObject{
  readonly type: CollisionType;
  protected triangle: CollisionTriangle;
  constructor(x:number, y: number,
    x1: number, y1: number, 
    x2: number, y2: number, 
    x3: number, y3: number){
      this.type = CollisionType.Triangle;
      this.triangle = new CollisionTriangle(x, y, x1, y1, x2, y2, x3, y3);
  }
  add_debug(scene: Phaser.Scene): void{
    this.triangle.add_debug(scene);
  };
  set_debug_state(state: DebugState): void {
    this.triangle.set_debug_state(state);
  }
  get_geom_shape(): GeneralCollisionObject {
    return {triangle: this.triangle}
  }
  is_collision(object: CollisionObject): boolean{
    return is_triangle_object_collision(this.triangle, object);
  }
  is_point_collision(x:number, y: number): boolean{
    return this.triangle.contains(x, y);
  }
}

class TriangleCollisionObject extends StaticTriangleCollisionObject implements CollisionObject{
  move(velocity: Phaser.Math.Vector2){
    this.triangle.move(velocity);
  }
  rotate(angle: number): void{
    this.triangle.rotate(angle);
  };
  move_to(x:number, y:number): void{
    this.triangle.move_to(x, y);
  }
}

class RectangleCollisionObject implements CollisionObject{
  readonly type: CollisionType;
  rectangle: CollisionRectangle;
  constructor(x:number, y: number, width: number, height: number){
    this.type = CollisionType.Rectangle;
    this.rectangle = new CollisionRectangle(x, y, width, height);
  }
  add_debug(scene: Phaser.Scene): void{
    this.rectangle.add_debug(scene);
  };
  set_debug_state(state: DebugState): void {
    this.rectangle.set_debug_state(state);
  }
  move(velocity: Phaser.Math.Vector2): void {
    this.rectangle.move(velocity);
  }
  rotate(angle: number): void {
    this.rectangle.rotate(angle);
  }
  move_to(x: number, y: number): void {
    this.rectangle.move_to(x, y);
  }

  get_geom_shape(): GeneralCollisionObject {
    return {rectangle: this.rectangle};
  }
  is_collision(object: CollisionObject): boolean {
    return is_rect_object_collision(this.rectangle, object);
  }
  is_point_collision(x: number, y: number): boolean {
    return this.rectangle.contains(x, y);
  }
  
}

interface CollisionShape{
  add_debug(scene: Phaser.Scene): void;
  set_debug_state(state: DebugState): void;
  move(velocity: Phaser.Math.Vector2): void;
  move_to(x:number, y:number): void;
}

class CollisionCircle extends Phaser.Geom.Circle implements CollisionShape{
  debug_area: Phaser.GameObjects.Shape | undefined;
  constructor(x:number, y: number, radius:number){
    super(x, y, radius);
    this.debug_area = undefined;
  }
  add_debug(scene: Phaser.Scene){
    this.debug_area = scene.add.circle(this.x, this.y, this.radius);
    set_debug_state(this.debug_area, DebugState.Default);
  }
  set_debug_state(state: DebugState){
    if(this.debug_area) set_debug_state(this.debug_area, state);
  }
  move(velocity: Phaser.Math.Vector2){
    this.x += velocity.x;
    this.y += velocity.y;
    this.debug_area?.setX(this.x+velocity.x);
    this.debug_area?.setY(this.y+velocity.y);
  }
  move_to(x:number, y:number): void{
    this.setPosition(x, y);
    this.debug_area?.setX(x);
    this.debug_area?.setY(y);
  }
}

class AxisCollisionRectangle extends Phaser.Geom.Rectangle implements CollisionShape{
  debug_area: Phaser.GameObjects.Rectangle | undefined;
  constructor(x: number, y: number, width: number, height: number){
    super(x, y, width, height);
    this.debug_area = undefined;
  }
  add_debug(scene: Phaser.Scene){
    this.debug_area = scene.add.rectangle(this.x+this.width/2, this.y+this.height/2, this.width, this.height);
    set_debug_state(this.debug_area, DebugState.Default);
  }
  set_debug_state(state: DebugState){
    if(this.debug_area) set_debug_state(this.debug_area, state);
  }
  move(velocity: Phaser.Math.Vector2){
    this.x += velocity.x;
    this.y += velocity.y;
    this.debug_area?.setX(this.x+this.width/2+velocity.x);
    this.debug_area?.setY(this.y+this.height/2+velocity.y);
  }
  move_to(x:number, y:number): void{
    this.setPosition(x-this.width/2, y-this.height/2);
    this.debug_area?.setX(x);
    this.debug_area?.setY(y);
  }
}

class CollisionTriangle extends Phaser.Geom.Triangle implements CollisionShape{
  debug_area: Phaser.GameObjects.Triangle | undefined;
  origin: Phaser.Geom.Point;
  current_radians: number;
  constructor(x:number, y: number, 
    x1: number, y1: number, 
    x2: number, y2: number, 
    x3: number, y3: number){
    super(x1, y1, x2, y2, x3, y3);
    this.origin = new Phaser.Geom.Point(x, y);
    this.debug_area = undefined;
    this.current_radians = 0;
  }
  add_debug(scene: Phaser.Scene){
    const triangle_width = this.right - this.left;
    const triangle_height = this.right - this.left;
    const x_offset = triangle_width/2 - this.origin.x;
    const y_offset = triangle_height/2 - this.origin.y;
    this.debug_area = scene.add.triangle(this.origin.x, this.origin.y, 
      this.x1+x_offset, this.y1+y_offset, 
      this.x2+x_offset, this.y2+y_offset, 
      this.x3+x_offset, this.y3+y_offset
    );

    set_debug_state(this.debug_area, DebugState.Default);
  }
  set_debug_state(state: DebugState){
    if(this.debug_area) set_debug_state(this.debug_area, state);
  }
  move(velocity: Phaser.Math.Vector2){
    this.x1 += velocity.x; this.x2 += velocity.x; this.x3 += velocity.x;
    this.y1 += velocity.y; this.y2 += velocity.y; this.y3 += velocity.y;
    this.debug_area?.setX(this.debug_area.x+velocity.x);
    this.debug_area?.setY(this.debug_area.y+velocity.y);
    this.origin.x += velocity.x;
    this.origin.y += velocity.y;
  }
  rotate(angle: number){
    if(angle !== this.current_radians){
      const rotation_difference = angle - this.current_radians;
      const new_triangle = Phaser.Geom.Triangle.RotateAroundPoint(this, this.origin, rotation_difference);
      this.x1 = new_triangle.x1; this.x2 = new_triangle.x2; this.x3 = new_triangle.x3;
      this.y1 = new_triangle.y1; this.y2 = new_triangle.y2; this.y3 = new_triangle.y3;
      this.debug_area?.setRotation(angle);
    }
    this.current_radians = angle;
  }
  move_to(x:number, y:number): void{
    const mx = x - this.origin.x;
    const my = y - this.origin.y;
    this.origin.x = x; this.origin.y = y;
    this.x1 += mx; this.x2 += mx; this.x3 += mx;
    this.y1 += my; this.y2 += my; this.y3 += my;
    this.debug_area?.setX(x);
    this.debug_area?.setY(y);
  }
}

class CollisionRectangle implements CollisionShape{
  debug_area: Phaser.GameObjects.Rectangle | undefined;

  debug_triangle1: Phaser.GameObjects.Triangle | undefined; // for implementation debugging
  debug_triangle2: Phaser.GameObjects.Triangle | undefined;

  triangle1: Phaser.Geom.Triangle;
  triangle2: Phaser.Geom.Triangle;
  x: number; y: number;
  width: number; height: number;
  current_radians: number;
  constructor(x: number, y: number, width: number, height: number){
    this.debug_area = undefined;
    this.x = x; this.y = y;
    this.width = width;
    this.height = height;
    this.current_radians = 0;
    
    this.triangle1 = new Phaser.Geom.Triangle(x, y, x+width, y, x+width, y+height);

    this.triangle2 = new Phaser.Geom.Triangle(x, y, x, y+height, x+width, y+height);
  }
  add_debug(scene: Phaser.Scene){
    this.debug_area = scene.add.rectangle(this.x+this.width/2, this.y+this.height/2, this.width, this.height);
    const x_offset = this.width/2;
    const y_offset = this.height/2;
    this.debug_triangle1 = scene.add.triangle(this.x+x_offset, this.y+y_offset, 
      0, 0, 
      this.width, 0, 
      this.width, this.height
    );
    this.debug_triangle2 = scene.add.triangle(this.x+x_offset, this.y+y_offset,
      0, 0, 
      0, this.height,
      this.width, this.height
    );
    
    set_debug_state(this.debug_area, DebugState.Default);
    set_debug_state(this.debug_triangle1, DebugState.Default);
    set_debug_state(this.debug_triangle2, DebugState.Default);
  }
  set_debug_state(state: DebugState){
    if(this.debug_area) set_debug_state(this.debug_area, state);
    if(this.debug_triangle1) set_debug_state(this.debug_triangle1, state);
    if(this.debug_triangle2) set_debug_state(this.debug_triangle2, state);
  }
  move(velocity: Phaser.Math.Vector2){
    this.triangle1.x1 += velocity.x; this.triangle1.x2 += velocity.x; this.triangle1.x3 += velocity.x;
    this.triangle1.y1 += velocity.y; this.triangle1.y2 += velocity.y; this.triangle1.y3 += velocity.y;
    this.triangle2.x1 += velocity.x; this.triangle2.x2 += velocity.x; this.triangle2.x3 += velocity.x;
    this.triangle2.y1 += velocity.y; this.triangle2.y2 += velocity.y; this.triangle2.y3 += velocity.y;
    this.debug_area?.setX(this.debug_area.x+velocity.x);
    this.debug_area?.setY(this.debug_area.y+velocity.y);
    this.debug_triangle1?.setX(this.debug_triangle1.x+velocity.x);
    this.debug_triangle1?.setY(this.debug_triangle1.y+velocity.y);
    this.debug_triangle2?.setX(this.debug_triangle2.x+velocity.x);
    this.debug_triangle2?.setY(this.debug_triangle2.y+velocity.y);
    this.x += velocity.x;
    this.y += velocity.y;
  }
  rotate(angle: number){
    if(angle !== this.current_radians){
      const rotation_difference = angle - this.current_radians;
      const origin = new Phaser.Geom.Point(this.x+this.width/2, this.y+this.height/2);
      this.triangle1 = Phaser.Geom.Triangle.RotateAroundPoint(this.triangle1, origin, rotation_difference);
      this.triangle2 = Phaser.Geom.Triangle.RotateAroundPoint(this.triangle2, origin, rotation_difference);
      this.debug_area?.setRotation(angle);
      this.debug_triangle1?.setRotation(angle);
      this.debug_triangle2?.setRotation(angle);
    }
    this.current_radians = angle;
  }
  move_to(x:number, y:number): void{
    const new_x = this.width/2;
    const new_y = this.height/2;

    this.debug_triangle1?.setX(new_x);
  }
  contains(x:number, y: number){
    return this.triangle1.contains(x, y) || this.triangle2.contains(x, y);
  }
}


function set_debug_state(shape: Phaser.GameObjects.Shape, state: DebugState){
  switch(state){
    case DebugState.Default:
    shape.setStrokeStyle(
      debug_collision_styles.outline_line_width, 
      debug_collision_styles.default_outline.color, 
      debug_collision_styles.default_outline.alphaGL
    );
    break;
    case DebugState.Collision:
    shape.setStrokeStyle(
      debug_collision_styles.outline_line_width, 
      debug_collision_styles.collision_outline.color, 
      debug_collision_styles.collision_outline.alphaGL
    );
    break;
  }
}

function is_circle_object_collision(circle: Phaser.Geom.Circle, object: CollisionObject): boolean{
  const obj = object.get_geom_shape();
  switch(object.type){
    case CollisionType.Circle:
      if(!obj.circle) return false;
      return Phaser.Geom.Intersects.CircleToCircle(circle, obj.circle);
    case CollisionType.AxisRectangle:
      if(!obj.axis_rectangle) return false;
      return Phaser.Geom.Intersects.CircleToRectangle(circle, obj.axis_rectangle);
    case CollisionType.Triangle: 
      if(!obj.triangle) return false;
      return Phaser.Geom.Intersects.TriangleToCircle(obj.triangle, circle);
      case CollisionType.Rectangle:
        if(!obj.rectangle) return false;
        return Phaser.Geom.Intersects.TriangleToCircle(obj.rectangle.triangle1, circle) 
        || Phaser.Geom.Intersects.TriangleToCircle(obj.rectangle.triangle2, circle);
  }
  return false;
}

function is_axis_rect_object_collision(rect: Phaser.Geom.Rectangle, object: CollisionObject): boolean{
  const obj = object.get_geom_shape();
  switch(object.type){
    case CollisionType.Circle:
      if(!obj.circle) return false;
      return Phaser.Geom.Intersects.CircleToRectangle(obj.circle, rect);
    case CollisionType.AxisRectangle:
      if(!obj.axis_rectangle) return false;
      return Phaser.Geom.Intersects.RectangleToRectangle(rect, obj.axis_rectangle);
    case CollisionType.Triangle: 
      if(!obj.triangle) return false;
      return Phaser.Geom.Intersects.RectangleToTriangle(rect, obj.triangle);
    case CollisionType.Rectangle:
      if(!obj.rectangle) return false;
      return Phaser.Geom.Intersects.RectangleToTriangle(rect, obj.rectangle.triangle1) 
      || Phaser.Geom.Intersects.RectangleToTriangle(rect, obj.rectangle.triangle2);
  }
  return false;
}

function is_triangle_object_collision(triangle: Phaser.Geom.Triangle, object: CollisionObject): boolean{
  const obj = object.get_geom_shape();
  switch(object.type){
    case CollisionType.Circle:
      if(!obj.circle) return false;
      return Phaser.Geom.Intersects.TriangleToCircle(triangle, obj.circle);
    case CollisionType.AxisRectangle:
      if(!obj.axis_rectangle) return false;
      return Phaser.Geom.Intersects.RectangleToTriangle(obj.axis_rectangle, triangle);
    case CollisionType.Triangle: 
      if(!obj.triangle) return false;
      return Phaser.Geom.Intersects.TriangleToTriangle(triangle, obj.triangle);
    case CollisionType.Rectangle:
      if(!obj.rectangle) return false;
      return Phaser.Geom.Intersects.TriangleToTriangle(triangle, obj.rectangle.triangle1) 
      || Phaser.Geom.Intersects.TriangleToTriangle(triangle, obj.rectangle.triangle2);
  }
  return false;
}

function is_rect_object_collision(rect: CollisionRectangle, object: CollisionObject): boolean{
  const obj = object.get_geom_shape();
  switch(object.type){
    case CollisionType.Circle:
      if(!obj.circle) return false;
      return Phaser.Geom.Intersects.TriangleToCircle(rect.triangle1, obj.circle) 
      || Phaser.Geom.Intersects.TriangleToCircle(rect.triangle2, obj.circle);
    case CollisionType.AxisRectangle:
      if(!obj.axis_rectangle) return false;
      return Phaser.Geom.Intersects.RectangleToTriangle(obj.axis_rectangle, rect.triangle1) 
      || Phaser.Geom.Intersects.RectangleToTriangle(obj.axis_rectangle, rect.triangle2);
    case CollisionType.Triangle:
      if(!obj.triangle) return false;
      return Phaser.Geom.Intersects.TriangleToTriangle(rect.triangle1, obj.triangle) 
      || Phaser.Geom.Intersects.TriangleToTriangle(rect.triangle2, obj.triangle);
    case CollisionType.Rectangle:
      if(!obj.rectangle) return false;
      return Phaser.Geom.Intersects.TriangleToTriangle(rect.triangle1, obj.rectangle.triangle1) 
      || Phaser.Geom.Intersects.TriangleToTriangle(rect.triangle2, obj.rectangle.triangle1)
      || Phaser.Geom.Intersects.TriangleToTriangle(rect.triangle1, obj.rectangle.triangle2)
      || Phaser.Geom.Intersects.TriangleToTriangle(rect.triangle2, obj.rectangle.triangle2);
  }
  return false;
}

function is_point_object_collision(){
  
}

/*

export type CollisionPoint = Pick<CollisionObject, "type" | "point">;
 
export function is_collision(co1: CollisionObject, co2: CollisionObject):boolean{
  switch(co1.type){
  case CollisionType.Circle:
    if(co1.circle === undefined) return false;
    switch(co2.type){
    case CollisionType.Circle:
      if(co2.circle === undefined) return false;
      return Phaser.Geom.Intersects.CircleToCircle(co1.circle, co2.circle);
    case CollisionType.Point:
      if(co2.point === undefined) return false;
      return co1.circle.contains(co2.point.x, co2.point.y);
    }
    break;
  case CollisionType.Point:
    if(co1.point === undefined) return false;
    return is_point_object_collision(co1.point, co2);
  }

  return false;
}
export type CollisionDisplayObject = {
  display_object: Display.DisplayObject;
  collision_areas: CollisionObject[];
}


export function is_point_object_collision(point: Phaser.Geom.Point, object: CollisionObject):boolean{
  switch(object.type){
    case CollisionType.Circle:
      if(object.circle === undefined) return false;
      return object.circle.contains(point.x, point.y);
    case CollisionType.Line:
      if(object.line === undefined) return false;
      return Phaser.Geom.Intersects.PointToLine(point, object.line);
    case CollisionType.Point:
      if(object.point === undefined) return false;
      return point.x == object.point.x && point.y == object.point.y;
  }
  return false;
}

*/

/*
export function new_circle_collision(x?:number, y?:number, radius:number=1): CollisionObject{
  return {type: CollisionType.Circle, circle: new Phaser.Geom.Circle(x, y, radius)};
}
*/

/*

export function new_point_collision(x: number, y: number): CollisionPoint{
  return {type: CollisionType.Point, point: new_geom_point(x, y)};
}

export function new_geom_point(x: number, y: number): Phaser.Geom.Point{
  return new Phaser.Geom.Point(x, y);
}

export function new_debug_collision_graphics(scene: Phaser.Scene, object: CollisionObject, 
  fill?: Phaser.Display.Color, outline_colour?: Phaser.Display.Color, line_width?: number)
:Phaser.GameObjects.Graphics | undefined{
  switch(object.type){
    case CollisionType.Circle:
      if(object.circle === undefined) return undefined;
      return GeomGraphics.draw_circle_graphics(scene, object.circle, fill, outline_colour, line_width);
  }
  return undefined;
}

export function new_debug_collision_shape_graphics(scene: Phaser.Scene, object: CollisionObject, 
  fill?: Phaser.Display.Color, outline_colour?: Phaser.Display.Color, line_width?: number)
  :Phaser.GameObjects.Shape | undefined{
    switch(object.type){
      case CollisionType.Circle:
        if(object.circle === undefined) return undefined;
        return GeomGraphics.draw_circle_shape(scene, object.circle, fill, outline_colour, line_width);
    }
    return undefined;

}*/