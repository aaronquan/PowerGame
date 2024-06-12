import * as Sprites from "./../graphics/sprites";

export type DistanceEntity = {
  distance_sq: number;
  entity: Sprites.DisplayObject;
  index: number;
}

export type DistancePoint = {
  distance_sq: number;
  point: Phaser.Math.Vector2;
  index: number;
}

export function closestPointToEntity(point:Phaser.Math.Vector2, 
  entities: Sprites.DisplayObject[]): DistanceEntity | undefined{
  
  let closest: DistanceEntity | undefined = undefined;
  for(let i = 0; i < entities.length; ++i){
    const entity = entities[i];
  //for(const entity of entities){
    if(entity.body){
      const vec = new Phaser.Math.Vector2(entity.x - point.x, entity.y - point.y);
      if(closest){
        if(vec.lengthSq() < closest.distance_sq){
          closest = {entity: entity, distance_sq: vec.lengthSq(), index: i};
        }
      }else{
        closest = {entity: entity, distance_sq: vec.lengthSq(), index: i};
      }
    }
  }
  return closest;
}

export function closestEntityToEntity(source:Sprites.DisplayObject, 
  entities: Sprites.DisplayObject[]): DistanceEntity | undefined{
  if(!source.body) return undefined;
  let closest: DistanceEntity | undefined = undefined;
  for(let i = 0; i < entities.length; ++i){
    const entity = entities[i];
  //for(const entity of entities){
    if(entity.body){
      const vec = new Phaser.Math.Vector2(entity.body.position.x - source.x, entity.body.position.y - source.y);
      if(closest){
        if(vec.lengthSq() < closest.distance_sq){
          closest = {entity: entity, distance_sq: vec.lengthSq(), index: i};
        }
      }else{
        closest = {entity: entity, distance_sq: vec.lengthSq(), index: i};
      }
    }
  }
  return closest;
}

export function closestPointToPoints(source:Phaser.Math.Vector2, 
  points: Phaser.Math.Vector2[]): DistancePoint | undefined{
  let closest: DistancePoint | undefined = undefined;
  for(let i = 0; i < points.length; ++i){
    const pt = points[i];
  //for(const pt of points){
    const vec = new Phaser.Math.Vector2(pt.x - source.x, pt.y - source.y);
    const len = vec.lengthSq();
    if(closest){
      if(len < closest.distance_sq){
        closest = {point: pt, distance_sq: len, index: i};
      }
    }else{
      closest = {point: pt, distance_sq: len, index: i};
    }
  }
  return closest;
}

export function closestEntityToPoints(source:Sprites.DisplayObject, 
  points: Phaser.Math.Vector2[]): DistancePoint | undefined{
    if(!source.body) return undefined;
  let closest: DistancePoint | undefined = undefined;
  for(let i = 0; i < points.length; ++i){
    const pt = points[i];
  //for(const pt of points){
    const vec = new Phaser.Math.Vector2(pt.x - source.x, pt.y - source.y);
    const len = vec.lengthSq();
    if(closest){
      if(vec.lengthSq() < closest.distance_sq){
        closest = {point: pt, distance_sq: len, index: i};
      }
    }else{
      closest = {point: pt, distance_sq: len, index: i};
    }
  }
  return closest;
}

export function closestInRangeEntityToEntities(source:Sprites.DisplayObject, entities: Sprites.DisplayObject[], range: number): DistanceEntity[]{
  if(!source.body) return [];
  const entities_in_range: DistanceEntity[] = [];
  for(let i = 0; i < entities.length; ++i){
    const entity = entities[i];
    if(entity.body){
      const vec = new Phaser.Math.Vector2(entity.x - source.x, entity.y - source.y);
      const len = vec.lengthSq();
      if(len < range){
        entities_in_range.push({entity: entity, distance_sq: len, index: i});
      }
    }
  }
  return entities_in_range;
}