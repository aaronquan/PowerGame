

import * as PowerGameMap from './../map/PowerGameMap';
import * as Player from "./../player/player";
import * as  Keys from "../../utils/keys";

export class PowerGame extends Phaser.Scene{
  key_map: Keys.InputKeyMap;

  map: PowerGameMap.PowerGameMap;
  player: Player.Player;
  constructor(){
    super('PowerGame');
  }

  create(){
    //input
    this.key_map = new Keys.InputKeyMap();
    this.key_map.add_keys(this.input, ['W', 'A', 'S', 'D']);

    //map
    this.map = new PowerGameMap.PowerGameMap(this);

    //player
    this.player = new Player.Player(this, 100, 100)

  }
  update(){
    this.player.move_player(this.key_map);
  }
}

export default PowerGame;