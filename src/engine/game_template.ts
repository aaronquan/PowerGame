import { AUTO, Game, Types } from 'phaser';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

export function default_config(scenes: Types.Scenes.SceneType | Types.Scenes.SceneType[], 
  parent: string="game-container",
  width: number=1024, height: number=768,):Types.Core.GameConfig{
  return{
    type: AUTO,
    width: width,
    height: height,
    parent: parent,
    backgroundColor: '#223344',
    scene: scenes,
    physics: {
        default: "arcade",
        arcade: {
          debug: true
        }
    },
  }
}

export function matter_config(scenes: Types.Scenes.SceneType | Types.Scenes.SceneType[], 
  parent: string="game-container",
  width: number=1024, height: number=768,):Types.Core.GameConfig{
  return{
    type: AUTO,
    width: width,
    height: height,
    parent: parent,
    backgroundColor: '#223344',
    scene: scenes,
    physics: {
        default: "matter",
        matter: {
          gravity: { x: 0, y: 0 }, 
          debug: true
        }
    },
  }
}


const example_config = (parent: string) => default_config([], parent); // write example


//original code
const StartGame = (parent: string) => {
  const config = example_config(parent);
  return new Phaser.Game({ ...config, parent });
}

export default StartGame;