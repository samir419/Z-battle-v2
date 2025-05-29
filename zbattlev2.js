var info_data = document.getElementById("info data");
var p1_data = document.getElementById("player1_data");
 var p2_data = document.getElementById("player2_data");
var player_health = document.getElementById('player-health');
var enemy_health = document.getElementById('enemy-health');
var terminal = document.getElementById("terminal");
var damage;
var playstate = 0;
var turn_count = 0;
var cpu = false;

function append_message(msg){
    let message = document.createElement('p');
    message.innerHTML = msg
    info_data.appendChild(message)
}

class Player{
  constructor(name,hp,weight,status,moves,logdata){
      this.name = name;
      this.hp = hp;
      this.weight=weight;
      this.status = status;
      this.moves = []
      this.lastMoveUsed;
      this.data = logdata
  }
  addmove(move){
      const newmove = new Move(move.name,move.power,move.type,move.turns,move.dp,move.weight,move.heal,move.effects);
      this.moves.push(newmove);
     this.weight += newmove.weight;
      console.log(this.weight);
  }
  calculate_weight(arr){
      for (let i =0; i >arr.length; i++){
          this.weight+=arr[i].weight;
      }
      return this.weight;
  }
};

class Move{
constructor(name,power,type,turns,dp,weight,heal,effects,isEnabled){
      this.name = name;
      this.power = power;
      this.type = type
      this.turnreserve = turns
      this.turns = turns
      this.dp = dp
      this.weight = weight
      this.heal = heal
      this.effects = effects
      this.active = false;
      this.isEnabled = true;
      this.effected_moves = []
  }
use(attacker,defender){
     if (this.dp >= 1){
        this.active=true;
        this.turns=this.turnreserve
         append_message(`${attacker.name} used ${this.name}`)
          if(this.type == 'attack'){
            defender.hp -=  this.damage_calc(attacker,defender);
          }
         
          attacker.hp += this.heal;
          if(defender.status == 'thorns'){
            append_message('thorn effect: ')
            attacker.hp-= this.damage_calc(attacker,defender)
          }
          if(playstate==1&&attacker.weight>defender.weight){
            this.effect(attacker,defender);
          }
          if(this.name=='mirror match'){
            this.effect(attacker,defender)
          }
         this.dp -=1;
     }
     else{append_message('no dp')}
  }
damage_calc(attacker,defender){
     damage = this.power;
  
    if (attacker.status == "player power"){
        damage +=100;
          
    }
    if (attacker.status == "player power 2"){
        damage +=200;
          
    }
    if (defender.status == "guard"){
        damage/=2;
    }
   append_message(`${damage} damage`)
    return damage;   
     
}
  effect(attacker,defender){
  if (this.turns >=0 && this.active==true){
       if (this.effects=="guard"){
            attacker.status="guard";
            attacker.logdata = `${this.effects}:${this.turns}`;
            if(this.turns <= 0){
                this.active = false
            }
            this.turns -=1
        }

        if (this.effects=="player power"){
            attacker.status="player power";
            attacker.logdata = `${this.effects}:${this.turns}`;
            if(this.turns <= 0){
                this.active = false
            }
            this.turns -=1
        }
        if (this.effects=="player power 2"){
            attacker.status="player power 2";
            attacker.logdata = `${this.effects}:${this.turns}`;
            if(this.turns <= 0){
                this.active = false
            }
            this.turns -=1
        }

        if (this.effects=="thorns"){
            attacker.status="thorns";
            attacker.logdata = `${this.effects}:${this.turns}`;
            if(this.turns <= 0){
                this.active = false
            }
            this.turns -=1
        }
        if (this.effects=="disable"){
           if(defender.lastMoveUsed){
            this.effected_moves.push(defender.lastMoveUsed)
            this.effected_moves[0].isEnabled = false;
            this.effected_moves[0].active=false;
            append_message(`${attacker.name} disable effect ${this.turns} turns left `);
            if(this.turns <= 0){
                this.active = false
                this.effected_moves[0].isEnabled = true
                this.effected_moves = []
            }
            this.turns -=1
           }else{info_data.innerHTML='no move has been used'}
        }
        if (this.effects=="rapture"){
           append_message(`rapture effect in ${this.turns} ('turns')`)
            if(this.turns <= 0){
                this.active = false
            }
            this.turns -=1
            if(this.turns==0){
                attacker.hp-= this.damage_calc(attacker,defender);
                defender.hp-= this.damage_calc(attacker,defender);
                append_message('rapture effect commence')
            }
        }
        if(this.effects == "mirror"){
            if(!defender.lastMoveUsed){
                append_message('no moves used')
                this.active = false
            }else{
                defender.lastMoveUsed.dp++
                defender.lastMoveUsed.use(attacker,defender)
                this.active = false
            }
            
        }
        if(this.effects == "disable attack"){
            for(let i=0;i<defender.moves.length;i++){
                if(defender.moves[i].type=="attack"){
                    defender.moves[i].isEnabled = false
                }
            }
            if(this.turns <= 0){
                for(let i=0;i<defender.moves.length;i++){
                    if(defender.moves[i].type=="attack"){
                        defender.moves[i].isEnabled = true
                    }
                }
                this.active = false
            }
            this.turns-=1
        }
        
      
    }
   
    else{
        if(attacker.status=='none'){
            attacker.logdata = 'none'
        }
        return 0;}

  }
}

const Zmoves = [
    new Move('null',0,'',0,0,0,0,'none'),
    new Move('strike',300,'attack',0,5,3,0,'none'),
    new Move('replenish',0,'spell',0,1,5,500,'none'),
    new Move('blast cannon',500,'attack',0,1,5,0,'none'),
    new Move('forcefield',0,'spell',2,1,2,0,'guard'),
    new Move('demon charge',600,'attack',0,2,3,-300,'none'),
    new Move('power up',0,'spell',4,2,1,0,'player power'),
    new Move('angel guard',0,'spell',1,1,4,300,'guard'),
    new Move('holy blade',300,'attack',0,1,3,300,'none'),
    new Move('shield strike',300,'attack',1,1,3,0,'guard'),
    new Move('malevonent armor',0,'spell',2,2,2,0,'thorns'),
    new Move('beast mode',0,'spell',2,2,2,0,'player power 2'),
    new Move('baneful binding',0,'spell',2,2,2,0,'disable'),
    new Move('hex claws',200,'attack',1,2,2,0,'disable'),
    new Move('rapture covenant',400,'spell',3,2,3,0,'rapture'),
    new Move('mirror match',0,'spell',1,1,1,0,'mirror')
]

const player1 = new Player("player1",1500,0,"none",[],document.getElementById('player1_data'));
const player2 = new Player("player2",1500,0,"none",[],document.getElementById('player2_data'));
const attack = new Move("attack",100,"attack",0,50,0,0,"none")
const defend = new Move("defend",0,"spell",2,50,0,0,"guard")


function playmove(move){
    info_data.innerHTML = " "
  if (playstate == 1){
    if(move.isEnabled==true){
        if(move.type=='attack'&&turn_count==0){
            info_data.innerHTML=('cannot use attacks on the first turn')
            playstate = 1;
        }else{
           
            move.use(player1,player2);
            player1.lastMoveUsed = move;
            player_health.innerHTML = player1.hp;
            enemy_health.innerHTML = player2.hp;
            p1_data.innerHTML=player1.logdata
            p2_data.innerHTML=player2.logdata
              playstate = 2;
              update();
        }
      
    }else{ info_data.innerHTML = ("move is disabled"); playstate = 1;}
       
   
  }
    else{
        info_data.innerHTML = ("player 2 turn");
        playstate = 1;
    }

    //terminal.innerHTML += info_data.innerHTML+"-----"
   

}
function playmovewithcpu(move){
    info_data.innerHTML = " "
    if (playstate == 1){
      if(move.isEnabled==true){
        if(move.type=='attack'&&turn_count==0){
            info_data.innerHTML=('cannot use attacks on the first turn');
            playstate = 1;
        }else{
           
            move.use(player1,player2);
            player1.lastMoveUsed = move;
            player_health.innerHTML = player1.hp;
            enemy_health.innerHTML = player2.hp;
            p1_data.innerHTML=player1.logdata
            p2_data.innerHTML=player2.logdata
              playstate = 2;
              if(player2.hp>0){
                  cpuplay();
              }else{update()}
        }
       
      }else{ info_data.innerHTML = ("move is disabled"); playstate = 1;}
         
     
    }
      else{
          info_data.innerHTML = ("player 2 turn");
          cpuplay();
      }
    

    //terminal.innerHTML += info_data.innerHTML+"-----"

}
function playmove2(move){
  if (playstate == 2){
    if(move.isEnabled==true){
        if(move.type=='attack'&&turn_count==0){
            info_data.innerHTML+=(' cannot use attacks on the first turn');
            playstate = 2;
            if(cpu==true){
                cpuplay()
            }
        }else{
          
            move.use(player2,player1);
            player2.lastMoveUsed = move;
            player_health.innerHTML = player1.hp;
            enemy_health.innerHTML = player2.hp;
            p1_data.innerHTML=player1.logdata
            p2_data.innerHTML=player2.logdata
              playstate = 1;
              update();
        }
       
    }else{ info_data.innerHTML = ("move is disabled"); playstate = 2;}
       
   
  }
    else{
        info_data.innerHTML = ("player 1 turn");
    }

    //terminal.innerHTML += info_data.innerHTML+"-----"
   
}
function cpuplay(){
    let rand = Math.floor(Math.random()*7);
    if(rand ==6){
        playmove2(attack);
    }else if(rand == 7){
        playmove2(defend)
    }else{
        if(player2.moves[rand].dp >0&&player2.moves[rand].isEnabled==true){
            playmove2(player2.moves[rand])
        }else{
            cpuplay();
        }
    }
    
   
}


  document.getElementById('enemy-move1').onclick = function() {
    playmove2(player2.moves[0])
}
document.getElementById('enemy-move2').onclick = function() {
    playmove2(player2.moves[1])
}
document.getElementById('enemy-move3').onclick = function() {
    playmove2(player2.moves[2])
}
document.getElementById('enemy-move4').onclick = function() {
    playmove2(player2.moves[3])
}
const music = new Audio ('zbattle theme loop.mp3');

function displayhealth(){
    document.getElementById('healthbar1').innerHTML= " ";
    document.getElementById('healthbar2').innerHTML= " ";
    for(var i =0; i<player1.hp/100;i++){
            const health = document.createElement("div");
            health.id = ('health');
            document.getElementById('healthbar1').appendChild(health);
    }
    for(var i =0; i<player2.hp/100;i++){
            const health = document.createElement("div");
            health.id = ('health2');
            document.getElementById('healthbar2').appendChild(health);
    }
}

function update(){
    turn_count += 0.5;
    document.getElementById('move1').innerHTML = player1.moves[0].name+player1.moves[0].dp;
    document.getElementById('move2').innerHTML = player1.moves[1].name+player1.moves[1].dp;
    document.getElementById('move3').innerHTML = player1.moves[2].name+player1.moves[2].dp;
    document.getElementById('move4').innerHTML = player1.moves[3].name+player1.moves[3].dp;
    document.getElementById('move5').innerHTML = player1.moves[4].name+player1.moves[4].dp;
    document.getElementById('move6').innerHTML = player1.moves[5].name+player1.moves[5].dp;
    player1.status = "none"
    player1.moves[0].effect(player1,player2);
    player1.moves[1].effect(player1,player2);
    player1.moves[2].effect(player1,player2);
    player1.moves[3].effect(player1,player2);
    player1.moves[4].effect(player1,player2);
    player1.moves[5].effect(player1,player2);

    document.getElementById('enemy-move1').innerHTML = player2.moves[0].name+player2.moves[0].dp;
    document.getElementById('enemy-move2').innerHTML = player2.moves[1].name+player2.moves[1].dp;
    document.getElementById('enemy-move3').innerHTML = player2.moves[2].name+player2.moves[2].dp;
    document.getElementById('enemy-move4').innerHTML = player2.moves[3].name+player2.moves[3].dp;
    document.getElementById('enemy-move5').innerHTML = player2.moves[4].name+player2.moves[4].dp;
    document.getElementById('enemy-move6').innerHTML = player2.moves[5].name+player2.moves[5].dp;
    player2.status = "none"
    player2.moves[0].effect(player2,player1);
    player2.moves[1].effect(player2,player1);
    player2.moves[2].effect(player2,player1);
    player2.moves[3].effect(player2,player1);
    player2.moves[4].effect(player2,player1);
    player2.moves[5].effect(player2,player1);

    displayhealth()
}

function gamestart(){
    if(document.getElementById("selection")){
        document.getElementById("selection").style.display = "none";
    }
    if( document.getElementById("selection2")){
         document.getElementById("selection2").style.display = "none"
    }
  
   
    //terminal.innerHTML = moves
   
    player_health.innerHTML = player1.hp;
    enemy_health.innerHTML = player2.hp;
   p1_data.innerHTML = player1.status;
   p2_data.innerHTML = player2.status;
    document.getElementById('move1').innerHTML = player1.moves[0].name+player1.moves[0].dp;
    document.getElementById('move2').innerHTML = player1.moves[1].name+player1.moves[1].dp;
    document.getElementById('move3').innerHTML = player1.moves[2].name+player1.moves[2].dp;
    document.getElementById('move4').innerHTML = player1.moves[3].name+player1.moves[3].dp;
    document.getElementById('move5').innerHTML = player1.moves[4].name+player1.moves[4].dp;
    document.getElementById('move6').innerHTML = player1.moves[5].name+player1.moves[5].dp;

    document.getElementById('enemy-move1').innerHTML = player2.moves[0].name+player2.moves[0].dp;
    document.getElementById('enemy-move2').innerHTML = player2.moves[1].name+player2.moves[1].dp;
    document.getElementById('enemy-move3').innerHTML = player2.moves[2].name+player2.moves[2].dp;
    document.getElementById('enemy-move4').innerHTML = player2.moves[3].name+player2.moves[3].dp;
    document.getElementById('enemy-move5').innerHTML = player2.moves[4].name+player2.moves[4].dp;
    document.getElementById('enemy-move6').innerHTML = player2.moves[5].name+player2.moves[5].dp;
  

   if(player1.weight < player2.weight){
    playstate = 1;
    info_data.innerHTML = "game started /// player1 pick move///";
   }else{
    playstate = 2;
    info_data.innerHTML = "game started /// player2 pick move///";
   }
   //music.play();
   if(cpu == true && player1.weight > player2.weight){
        let rand = Math.floor(Math.random()*7) 
        playmove2(player2.moves[rand])
   }
   displayhealth()
}
