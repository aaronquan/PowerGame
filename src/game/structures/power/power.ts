

export class PowerBar{
  power_capacity: number;
  current_power: number;
  power_regen:number;
  constructor(pc:number, cp:number){
    this.power_capacity = pc;
    this.current_power = cp;

    this.power_regen = 0.3;
  }
  spend_power(power:number):boolean{
    if(this.has_power(power)){
      this.current_power -= power;
      return true;
    }
    return false;
  }
  has_power(power:number): boolean{
    return power <= this.current_power
  }
  ratio(): number{
    return this.current_power/this.power_capacity;
  }
  add(power:number){
    this.current_power += power;
    if(this.current_power > this.power_capacity){
      this.current_power = this.power_capacity;
    }
  }
  regen(){
    this.add(this.power_regen);
  }
}

class Generator{
  
}