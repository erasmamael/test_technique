/**
* Author
 @Inateno / http://inateno.com / http://dreamirl.com

* ContributorsList
 @Inateno

***
simple Game declaration
**/
import DE from '@dreamirl/dreamengine';
var Game = {};

Game.render = null;
Game.scene = null;
Game.ship = null;
Game.obj = null;

/*---INIT--- */
Game.init = function() {
  // Create the renderer before assets start loading
  Game.render = new DE.Render('render', {
    resizeMode: 'stretch-ratio', //pour resize auto
    width: 1920,
    height: 1080, 
    backgroundColor: '0xF2f5a8b',//couleur si il n'y a pas de fond
    roundPixels: false, // ???
    powerPreferences: 'high-performance', 
  });
  Game.render.init();

  DE.start(); // demarer la creation
};
/*---end-init--- */


Game.onload = function() {
  console.log('game start');

  // scene
  Game.scene = new DE.Scene();


  /*---Camera---*/
  //                          x, y,
  Game.camera = new DE.Camera(0, 0, 1920, 1080, { //positionnement et forma
    scene: Game.scene,
    backgroundColor: '0xF2f5a8b'
  });
  
  Game.camera.interactive = true;
  Game.render.add(Game.camera);
  Game.ship;
  Game.menu;


  /*------Score------*/
  Game.score = new DE.GameObject({
    x:0,
    y:0,
    score: 0,
    renderer: new DE.TextRenderer(0, {
      x:100,
      y:20,
      textStyle:{
        fill: 'white',
        fontSize: 40,
        align:'left'
      }
    }),
  });

  /*---end-score---*/

  /*---MINE---*/
  function mineScroller() {
    this.x -= 4;
    if (this.x < 0) {
      this.x = 2000;
      this.y = 50 + 108 * (Math.floor(Math.random()*10));
      Game.score.renderer.text = ++Game.score.score;
    }
  }

  const mines = [];

  for (var j = 0; j < 4; j++) {
    for (var i = 0, mine; i <5; i++){

      mine = new DE.GameObject({
        x:2000 + 500*j,
        scale:1,
        renderers: [
          // view hitbox
          // new DE.RectRenderer(50,50, '0xFFCDCD', {
          //   lineStyle: [4, '0x000000', 1],
          //   fill:false,
          //   x:-25,
          //   y:-25
          // }),
          new DE.SpriteRenderer({ spriteName: 'mine', scale: 0.024}),
        ],
        interactive:true,
        hitArea: new DE.PIXI.Rectangle(-25,-25,50,50),
        scroller: mineScroller,
        automatisms: [['scroller', 'scroller']]

      });
      
      
      mine.y = 50 + 108 * (Math.floor(Math.random()*10));
      
      Game.scene.add(mine);
      mines.push(mine);
    }
  }

  /*---end-mine---*/


  /*---SHIP--- */


  function collisionsCheck(ship, mine) {
    // Calculer les coordonnées du centre du rectangle
    const centreRectangleX = ship.x;
    const centreRectangleY = ship.y;
  
    // Calculer la distance entre le centre du cercle et le centre du rectangle
    const distanceX = Math.abs(mine.x - centreRectangleX);
    const distanceY = Math.abs(mine.y - centreRectangleY);
  
    // Vérifier si le cercle et le rectangle sont trop éloignés pour être en collision
    if (distanceX > (ship.hitArea.width / 2 + mine.hitArea.height/2)) {
      return false;
    }
    if (distanceY > (ship.hitArea.height/ 2 + mine.hitArea.height/2)) {
      return false;
    }
  
    // Vérifier si le cercle et le trectangle se touchent en diagonale
    if (distanceX <= (ship.hitArea.width / 2)) {
      return true;
    }
    if (distanceY <= (ship.hitArea.height / 2)) {
      return true;
    }
  
    // Vérifier si le cercle et le rectangle se touchent sur les côtés
    const coinDistanceX = distanceX - ship.hitArea.width / 2;
    const coinDistanceY = distanceY - ship.hitArea.height / 2;
    const distanceAuxCoins = Math.sqrt(coinDistanceX * coinDistanceX + coinDistanceY * coinDistanceY);
    return (distanceAuxCoins <= mine.hitArea.height/2);

  }
  

  Game.ship = new DE.GameObject({
    x: 240,
    y: 240,
    scale: 1,
    renderers: [
      // view hitbox
      // new DE.RectRenderer(206,60, '0xFFCDCD', {
      //   lineStyle: [4, '0x000000', 1],
      //   fill:false,
      //   x:-103,
      //   y:-30
      // }),
      new DE.SpriteRenderer({
        spriteName: 'water_split',
        x:-10,
        scale: 1.25,
        rotation: Math.PI/2,
      }),
      new DE.SpriteRenderer({ spriteName: 'ship_medium', rotation:Math.PI/2, scale: 1.25 }), // image
      
    ],

    hitArea: new DE.PIXI.Rectangle(-103,-30,206,60),
    //_bounds: ({maxX: 1920, maxY:1080, minX: 0, minY:0}),

    axes: { x: 0, y: 0 },
    interactive: true,
    // fait la boucle de vérification d'input

    checkInputs: function() {
      mines.forEach(mine => {
        if(collisionsCheck(this, mine)){
          this._automatisms = {};
          this.shake(10,10);
          console.log('COLLISION');

          mines.forEach(mine => {
            mine._automatisms = {};
          });

          if(DE.Save.get('record') === void(0)) DE.Save.save('record', 0);
          if(Game.score.score > DE.Save.get('record')) DE.Save.save('record', Game.score.score);

          Game.menu.renderers[2].text = Game.score.score;
          Game.menu.renderers[4].text = DE.Save.get('record');
          Game.scene.add(Game.menu);
        }
      });

      //verification des bordure de map
      const newXPos = this.x + this.axes.x;
      const newYPos = this.y + this.axes.y;

      if( newXPos > 1920-Game.ship.hitArea.width/2 || newXPos < 0 + Game.ship.hitArea.width/2){
        this.axes.x = 0;
      }

      if( newYPos > 1080-Game.ship.hitArea.height/2 || newYPos < 0 + Game.ship.hitArea.height/2){
        this.axes.y = 0;
      }

      this.translate({ x: this.axes.x, y: this.axes.y });

      
    },
    automatisms: [['checkInputs', 'checkInputs']],

  });
  /*---end-ship--- */

  /*------GAME-OVER-MENU------*/
  Game.menu = new DE.GameObject({
    x: Game.camera.x,
    y: Game.camera.y,
    zindex: 100,
    renderers: [
      new DE.RectRenderer(700,300, '0xF90A4AE', {
        lineStyle: [4, '0x000000', 1],
        fill:true,
        x:-350,
        y:-150,
      }),
      new DE.TextRenderer('Score', {
        x:-175,
        y:-100
      }),
      new DE.TextRenderer( Game.score.score, {
        x:-175,
        y:-25,
        textStyle:{
          fontSize: 50,
          fontWeight: 'bold',
        }
      }),
      new DE.TextRenderer('Record', {
        x:175,
        y:-100
      }),
      new DE.TextRenderer(DE.Save.get('record'), {
        x:175,
        y:-25,
        textStyle:{
          fontSize: 50,
          fontWeight: 'bold',
        }
      }),
    ],
    gameObjects: [
      new DE.GameObject({
        y:90,
        renderers: [
          new DE.RectRenderer(350, 75, '0xFE05A55', {
            lineStyle: [4, '0x000000', 1],
            x:-175,
            y:-37.5,
          }),
          new DE.TextRenderer('', {
            localizationKey: 'playagain',
            textStyle:{
              fill: 'white',
              fontWeight: 'bold',
            }
          }),
        ],
        interactive:true,
        pointerover: function() {
          this.renderer.updateRender({
            color: '0xFde3737',
          });
        },
        pointerout: function() {
          this.renderer.updateRender({
            color:'0xFE05A55',
          });
        },
        pointerdown: function() {
          this.renderer.updateRender({
            color: '0xFbd2f2f',
          });
        },
        pointerup: function() {
          this.renderer.updateRender({
            color:'0xFde4343',
          });
          DE.start();
        },
      }),

    ],

  });

  /*---end-game-over-menu---*/

  /*---Add-Objects-To-Scene */
  Game.scene.add(
    Game.score,
    Game.ship,
  );

  /*------INPUTS------*/
  DE.Inputs.on('keyDown', 'left', function() {
    Game.ship.axes.x = -4;
  });
  DE.Inputs.on('keyUp', 'left', function() {
    if(Game.ship.axes.x<0) Game.ship.axes.x = 0;
  });


  DE.Inputs.on('keyDown', 'right', function() {
    Game.ship.axes.x = 2;
  });
  DE.Inputs.on('keyUp', 'right', function() {
    if(Game.ship.axes.x>0) Game.ship.axes.x = 0;
  });

  
  DE.Inputs.on('keyDown', 'up', function() { 
    Game.ship.axes.y = -2;  
  });
  DE.Inputs.on('keyUp', 'up', function() {
    if(Game.ship.axes.y<0) Game.ship.axes.y = 0;
  });


  DE.Inputs.on('keyDown', 'down', function() {
    Game.ship.axes.y = 2;
  });
  //on assigne les keyUp pour arreter le mouvement quand on arrete de cliquer 
  DE.Inputs.on('keyUp', 'down', function() {
    if(Game.ship.axes.y>0) Game.ship.axes.y = 0;
  });

  /*---end-inputs---*/
};

window.Game = Game;

export default Game;