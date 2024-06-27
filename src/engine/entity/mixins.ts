import * as Entity from "./entity";
import * as Collision from "./collision";
import * as Interface from "./../graphics/interface";
// mixins for entity

type GConstructor<T = {}> = new (...args: any[]) => T;

export type Entitiable = GConstructor<Entity.BaseEntity>;

export function MatterCollision<TBase extends Entitiable>(Base: TBase){
  return class MatterCollision extends Base{
    collision_area: MatterJS.Body
    constructor(...args: any[]){
      super(...args);
    }
  }
}

interface MoverEntity extends Entity.BaseEntity{
  readonly velocity: Phaser.Math.Vector2;
  //rotation: number;
  move_to(x:number, y:number): void;
  set_velocity(x:number, y:number): void;
}

type MoverEntitiable = GConstructor<MoverEntity>;

export function Moving<TBase extends Entitiable>(Base: TBase){
  return class SingleCollision extends Base implements MoverEntity{
    readonly velocity: Phaser.Math.Vector2;
    //rotation: number;
    constructor(...args: any[]){
      super(...args);
      this.velocity = new Phaser.Math.Vector2();
    }
    set_velocity(x:number, y:number): void{
      this.velocity.x = x; this.velocity.y = y; 
    }
    move_to(x:number, y:number): void{
      this.object.setX(x);
      this.object.setY(y);

    }
    update(){
      super.update();
      //this.object.setRotation()
      this.object.setX(this.object.x+this.velocity.x);
      this.object.setY(this.object.y+this.velocity.y);
    }
  }
}

export function StaticSingleCollides<TBase extends Entitiable>(Base: TBase){
  return class SingleCollision extends Base{
    collision_object: Collision.StaticCollisionObject | undefined;
    constructor(...args: any[]){
      super(...args);
      this.collision_object = undefined;
    }
    set_circle_collision(){
      const new_circle = Collision.CollisionObjectFactory.create_static_collision_circle(
        this.object.x, this.object.y, this.object.width/2, this.object.scene
      );
      this.collision_object = new_circle;
    }
    set_axis_rect_collision(){
      const new_rect = Collision.CollisionObjectFactory.create_static_collision_axis_rectangle(
        this.object.x-this.object.width/2, this.object.y-this.object.height/2, 
        this.object.width, this.object.height, this.object.scene
      );
      this.collision_object = new_rect;
    }
    is_entity_collision(entity: SingleCollision): boolean{
      if(!this.collision_object || !entity.collision_object) return false;
      return this.collision_object.is_collision(entity.collision_object);
    }
    is_point_collision(x:number, y: number){
      if(!this.collision_object) return false;
      return this.collision_object.is_point_collision(x, y);
    }
  }
}

export function SingleCollides<TBase extends MoverEntitiable>(Base: TBase){
  return class SingleCollision extends Base{
    collision_object: Collision.CollisionObject | undefined;
    constructor(...args: any[]){
      super(...args);
      this.collision_object = undefined;
    }
    set_circle_collision(){
      const new_circle = Collision.CollisionObjectFactory.create_collision_circle(
        this.object.x, this.object.y, this.object.width/2, this.object.scene
      );
      this.collision_object = new_circle;
    }
    set_axis_rect_collision(){
      const new_rect = Collision.CollisionObjectFactory.create_collision_axis_rectangle(
        this.object.x-this.object.width/2, this.object.y-this.object.height/2, 
        this.object.width, this.object.height, this.object.scene
      );
      this.collision_object = new_rect;
    }
    set_rect_collision(){
      const new_rect = Collision.CollisionObjectFactory.create_collision_rectangle(
        this.object.x-this.object.width/2, this.object.y-this.object.height/2, 
        this.object.width, this.object.height, this.object.scene
      );
      this.collision_object = new_rect;
    }
    is_entity_collision(entity: SingleCollision): boolean{
      if(!this.collision_object || !entity.collision_object) return false;
      return this.collision_object.is_collision(entity.collision_object);
    }
    is_point_collision(x:number, y: number){
      if(!this.collision_object) return false;
      return this.collision_object.is_point_collision(x, y);
    }
    move_to(x: number, y: number): void {
      super.move_to(x, y);
      this.collision_object?.move_to(x, y);
    }
    update(){
      super.update();
      this.collision_object?.rotate(this.object.rotation);
      this.collision_object?.move(this.velocity);
    }
  }
}

interface HealthEntity extends Entity.BaseEntity{
  max_health: number;
  current_health: number;
}

type HealthEntitiable = GConstructor<HealthEntity>;

export function Health<TBase extends Entitiable>(Base: TBase){
  return class Health extends Base implements HealthEntity{
    max_health: number;
    current_health: number;
    health_bar?: Interface.HealthBarObjectAttachment;
    constructor(...args: any[]){
      super(...args);
      //this.display_object = obj;
      this.max_health = 100;
      this.current_health = 100;
    }
    init_general_health_bar(){
      this.health_bar = {
        relative_position: new Phaser.Math.Vector2(0, -this.object.width/2),
        health_bar: new Interface.GeneralHealthBar(this.object.scene)
      };
      this.update_health_bar();
    }

    set_health_bar_position(x:number, y: number){
      if(this.health_bar){
        this.health_bar.relative_position.x = x;
        this.health_bar.relative_position.y = y;
      }
    }

    show_health_bar(){
      this.health_bar?.health_bar.show();
    }
    hide_health_bar(){
      this.health_bar?.health_bar.hide();
    }
    private update_health_bar(){
      if(this.health_bar){
        const x = this.object.x + this.health_bar.relative_position.x;
        const y = this.object.y + this.health_bar.relative_position.y;
        this.health_bar.health_bar.update_position(x, y);
      }
    }
    update(){
      super.update();
      this.update_health_bar();
    }
  }
}
