

export type DistanceEntity = {
  distance: number;
  entity: Phaser.GameObjects.GameObject
}

export type DistancePoint = {
  distance: number;
  point: Phaser.Math.Vector2;
}

export function closestPointToEntity(point:Phaser.Math.Vector2, 
  entities: Phaser.GameObjects.GameObject[]): DistanceEntity | undefined{
  
  let closest: DistanceEntity | undefined = undefined;
  for(const entity of entities){
    if(entity.body){
      const vec = new Phaser.Math.Vector2(entity.body.position.x - point.x, entity.body.position.y - point.y);
      if(closest){
        if(vec.lengthSq() < closest.distance){
          closest = {entity: entity, distance: vec.lengthSq()};
        }
      }else{
        closest = {entity: entity, distance: vec.lengthSq()};
      }
    }
  }
  return closest;
}

export function closestEntityToEntity(source:Phaser.GameObjects.GameObject, 
  entities: Phaser.GameObjects.GameObject[]): DistanceEntity | undefined{
  if(!source.body) return undefined;
  let closest: DistanceEntity | undefined = undefined;
  for(const entity of entities){
    if(entity.body){
      const vec = new Phaser.Math.Vector2(entity.body.position.x - source.body.position.x, entity.body.position.y - source.body.position.y);
      if(closest){
        if(vec.lengthSq() < closest.distance){
          closest = {entity: entity, distance: vec.lengthSq()};
        }
      }else{
        closest = {entity: entity, distance: vec.lengthSq()};
      }
    }
  }
  return closest;
}

export function closestPointToPoints(source:Phaser.Math.Vector2, 
  points: Phaser.Math.Vector2[]): DistancePoint | undefined{
  let closest: DistancePoint | undefined = undefined;
  for(const pt of points){
    const vec = new Phaser.Math.Vector2(pt.x - source.x, pt.y - source.y);
    if(closest){
      if(vec.lengthSq() < closest.distance){
        closest = {point: pt, distance: vec.lengthSq()};
      }
    }else{
      closest = {point: pt, distance: vec.lengthSq()};
    }
  }
  return closest;
}

export function closestEntityToPoints(source:Phaser.GameObjects.GameObject, 
  points: Phaser.Math.Vector2[]): DistancePoint | undefined{
    if(!source.body) return undefined;
  let closest: DistancePoint | undefined = undefined;
  for(const pt of points){
    const vec = new Phaser.Math.Vector2(pt.x - source.body.position.x, pt.y - source.body.position.y);
    if(closest){
      if(vec.lengthSq() < closest.distance){
        closest = {point: pt, distance: vec.lengthSq()};
      }
    }else{
      closest = {point: pt, distance: vec.lengthSq()};
    }
  }
  return closest;
}