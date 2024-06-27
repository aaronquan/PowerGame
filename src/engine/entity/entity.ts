import * as Display from "./../display";
import * as Interface from "./../graphics/interface";
import * as Collision from "./collision";

import * as EntityMixins from "./mixins";


export class EntityBank{
  entities: Map<number, Entity>;
  id:number;
  constructor(){
    this.entities = new Map();
    this.id = 0;
  }
  add_entity(entity: Entity): number{
    const cid = this.id;
    this.entities.set(cid, entity);
    entity.object.setData('entity_bank_id', cid);
    this.id++;
    return cid;
  }
  static get_display_object_id(obj: Entity):number | undefined{
    return obj.object.getData('entity_bank_id');
  }
}

export interface Entity{
  readonly object: Display.DisplayObject;
  update(): void;
}

//not used yet
export interface MatterCollisionEntity extends Entity{
  collision_area: MatterJS.BodyType
}

export class BaseEntity implements Entity{
  object: Display.DisplayObject;
  constructor(obj: Display.DisplayObject){
    this.object = obj;
  }
  update(){
  }
}

export const StaticHealthEntity = EntityMixins.Health(BaseEntity);

export const MovingEntity = EntityMixins.Moving(BaseEntity);

export const HealthEntity = EntityMixins.Health(MovingEntity);

export const StaticCollidesEntity = EntityMixins.StaticSingleCollides(BaseEntity);

export const StaticHealthCollisionEntity = EntityMixins.StaticSingleCollides(StaticHealthEntity);

//export const CollidesEntity = EntityMixins.SingleCollides(MovingEntity);

export class CollidesEntity extends EntityMixins.SingleCollides(MovingEntity){

}

export const CollidesHealthEntity = EntityMixins.SingleCollides(HealthEntity);

/*
export function Collides<TBase extends Entitiable>(Base: TBase){
  return class Collides extends Base
  {
    //display_object: Display.DisplayObject;
    collision_areas: Collision.CollisionObject[];

    debug_collision_area_display: (Phaser.GameObjects.Shape | undefined)[]; 
    debug_visible: boolean;

    constructor(...args: any[]){
      super(...args);
      this.collision_areas = [];
      this.debug_collision_area_display = [];
      this.debug_visible = false;
    }

    add_debug_display_collision_areas(collision_object: Collision.CollisionObject){
      const collision_graphics = Collision.new_debug_collision_shape_graphics(
        this.object.scene, collision_object, 
        Collision.debug_collision_styles.default_fill, 
        Collision.debug_collision_styles.default_outline, 
        Collision.debug_collision_styles.outline_line_width
      );
      this.debug_collision_area_display.push(collision_graphics);

    }

    private set_debug_collision_area_styles(
      fill?: Phaser.Display.Color, 
      outline_colour?: Phaser.Display.Color, 
      line_width:number=1
    ){
      for(const shape of this.debug_collision_area_display){
        shape?.setFillStyle(
          fill?.color, 
          fill?.alphaGL
        );
        shape?.setStrokeStyle(
          line_width, 
          outline_colour?.color, 
          outline_colour?.alphaGL
        );
      }
    }

    debug_point_collision(x: number, y: number){
      if(this.is_collision_point(x, y)){
        this.set_debug_collision_area_styles(
          Collision.debug_collision_styles.collision_fill, 
          Collision.debug_collision_styles.collision_outline,
          Collision.debug_collision_styles.outline_line_width
        );
      }else{
        this.set_debug_collision_area_styles(
          Collision.debug_collision_styles.default_fill, 
          Collision.debug_collision_styles.default_outline,
          Collision.debug_collision_styles.outline_line_width
        );
      }
    }

    show_debug_collisions(){
      this.debug_visible = true;
      for(const debug_area of this.debug_collision_area_display){
        debug_area?.setVisible(true);
      }
    }

    hide_debug_collisions(){
      this.debug_visible = false;
      for(const debug_area of this.debug_collision_area_display){
        debug_area?.setVisible(false);
      }
    }

    add_collision_area(collision_object: Collision.CollisionObject){
      this.collision_areas.push(collision_object);
      this.add_debug_display_collision_areas(collision_object);
    }

    //add_circle_collision(){
      //const collision = Collision.new_circle_collision(this.object.x, this.object.y, this.object.width/2);
      //this.add_collision_area(collision);
    //}

    is_collision_point(x: number, y: number): boolean{
      const new_point = Collision.new_point_collision(x, y);
      for(const collision_object of this.collision_areas){
        const is_collision = Collision.is_collision(collision_object, new_point);
        if(is_collision) return true;
      }
      return false;
    }
    is_collision_with_entity(entity: Collides): boolean{
      for(const collision_object of this.collision_areas){
        for(const entity_collision_object of entity.collision_areas){
          const is_collision = Collision.is_collision(collision_object, entity_collision_object);
          if(is_collision) return true;
        }
      }
      return false;
    }
  }
}*/