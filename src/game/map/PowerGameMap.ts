import * as Grid from "./PowerGameGrid";

export class PowerGameMap{
  scene: Phaser.Scene;
  grid: Grid.PowerGameGrid;

  constructor(scene:Phaser.Scene){
    this.grid = new Grid.PowerGameGrid(scene);

    this.grid.initialise();
  }
}