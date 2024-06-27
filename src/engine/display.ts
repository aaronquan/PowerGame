export type DisplayObject = DisplayPhysicsSprite | DisplayPhysicsImage | DisplaySprite | DisplayImage;


//requires scene to include physics
export class DisplayPhysicsSprite extends Phaser.Physics.Arcade.Sprite{
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    scene.physics?.add.existing(this);
    scene.sys.displayList.add(this);
    scene.sys.updateList.add(this);
  }
}

export class DisplayPhysicsImage extends Phaser.Physics.Arcade.Image{
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    scene.physics?.add.existing(this);
    scene.sys.displayList.add(this);
  }
}

export class DisplaySprite extends Phaser.GameObjects.Sprite{
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    scene.add.existing(this);
  }
}

export class DisplayImage extends Phaser.GameObjects.Image{
  constructor(scene: Phaser.Scene, x:number, y:number, texture:string){
    super(scene, x, y, texture);
    scene.add.existing(this);
  }
}