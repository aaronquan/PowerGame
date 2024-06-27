

export class InputKeyMap{
  keys: Map<string | number, Phaser.Input.Keyboard.Key>;

  constructor(){
    this.keys = new Map();
  }
  add_key(input: Phaser.Input.InputPlugin, k:string | number){
    if(input.keyboard){
      this.keys.set(k, input.keyboard.addKey(k));
    }
  }
  add_keys(input: Phaser.Input.InputPlugin, keys: (string | number)[]){
    for(const key of keys){
      this.add_key(input, key);
    }
  }
  is_key_down(key: string | number):boolean{
    if(!this.keys.has(key)){
      return false;
    }
    return this.keys.get(key)!.isDown;
  }
}

export class InputKeyHandler{
  
}