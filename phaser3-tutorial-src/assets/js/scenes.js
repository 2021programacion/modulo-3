console.log('carga');
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var game;
var config;
var sounds = {};//objeto vacio

var resizeGame = function () {
    let canvas = document.querySelector('canvas');
    const { innerWidth, innerHeight } = window; //object destructuring
    //const innerWidth = window.innerWidth;
    //const innerHeight = window.innerHeight;

    const ratio = innerWidth / innerHeight;

    const gameRatio = game.config.width / game.config.height;

    if (ratio < gameRatio) {
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerWidth / gameRatio + 'px';
    } else {
        canvas.style.width = innerHeight * gameRatio + 'px';
        canvas.style.height = innerHeight + 'px';
    }
}

var playSound = function(sound){
    sound.play("");
}
var stopSound = function(sound){
    sound.stop();
}

window.onload = function () {
    console.log('onload');
    config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        soundOn: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: [Inicio, Juego, Fin]
    };

    game = new Phaser.Game(config);
    window.focus();
    resizeGame();
    window.addEventListener('resize', resizeGame());
};



class Inicio extends Phaser.Scene {
    constructor() {
        super('inicio');
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });

        this.load.audio("death", ["assets/sounds/death.mp3", "assets/sounds/death.ogg"]);
        this.load.audio("run", ["assets/sounds/run.mp3", "assets/sounds/run.ogg"]);
        this.load.audio("pick", ["assets/sounds/pick.mp3", "assets/sounds/pick.ogg"]);
    }

    create() {
        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'dude', frame: 5 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 6, end: 9 }),
            frameRate: 10,
            repeat: -1
        });

        var logo = this.add.image(400, 300, 'logo').setScale(0.26)
        logo.setInteractive()
        logo.on('pointerdown', () => this.scene.start('juego'));
    }
}


class Juego extends Phaser.Scene {
    constructor() {
        super('juego');
    }

    create() {
        //  A simple background for our game
        this.add.image(400, 300, 'sky');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = this.physics.add.staticGroup();

        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        //  Now let's create some ledges
        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        // The player and its settings
        player = this.physics.add.sprite(100, 450, 'dude');

        //  Player physics properties. Give the little guy a slight bounce.
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);



        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();

        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        stars = this.physics.add.group({
            key: 'star',
            repeat: 3,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {

            //  Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        bombs = this.physics.add.group();

        //  The score
        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(player, stars, this.collectStar, null, this);

        this.physics.add.collider(player, bombs, this.hitBomb, null, this);

        console.log('this', this);

        sounds.death = this.sound.add("death");
        sounds.run = this.sound.add("run");
        sounds.pick = this.sound.add("pick");
    }

    update() {
        if (gameOver) {
            stopSound(sounds.run);
            return;
        }

        if(cursors.left.isUp || cursors.right.isUp){
            stopSound(sounds.run);
        }

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            playSound(sounds.run);
            player.anims.play('left', true);
        }
        else {
            if (cursors.right.isDown) {
                player.setVelocityX(160);
                playSound(sounds.run);
                player.anims.play('right', true);
            }
            else {
                player.setVelocityX(0);

                player.anims.play('turn');
            }
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
            player.anims.play('jump');
        }

    }

    collectStar(player, star) {
        playSound(sounds.pick);
        star.disableBody(true, true);
    
        //  Add and update the score
        score += 10;
        scoreText.setText('Score: ' + score);
    
        if (stars.countActive(true) === 0) {
            //  A new batch of stars to collect
            stars.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
    
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(0.2, 0.5);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
    
        }
    }
    
    hitBomb(player, bomb) {
        playSound(sounds.death);

        this.physics.pause();
    
        player.setTint(0xff0000);
    
        player.anims.play('turn');
    
        gameOver = true;

        var gameOverButton = this.add.text(700, 500, 'Game Over', { fontFamily: 'Arial', fontSize: 70, color: '#ff0000' })
        .setInteractive()
        .on('pointerdown', () => this.scene.start('fin'));
        Phaser.Display.Align.In.Center(gameOverButton, this.add.zone(400, 300, 800, 600));
    }
}


class Fin extends Phaser.Scene {
    constructor() {
        super('fin');
    }

    preload() {
        this.load.image('logo2D', 'assets/logo2D.png');
    }

    create() {
        this.add.image(400, 300, 'sky');
        this.add.image(400, 568, 'ground').setScale(2)
        this.add.image(400, 100, 'logo2D');

        let puntajefinal = this.add.text(0, 0, 'Score: ' + score,  { fontFamily: 'Arial', fontSize: 70, color: '#000000' });
        Phaser.Display.Align.In.Center(puntajefinal, this.add.zone(400, 300, 800, 600));



      let restartButton = this.add.text(700, 500, 'Restart', { fontFamily: 'Arial', fontSize: 20, color: '#000000' })
      .setInteractive()
      .on('pointerdown', () => this.scene.start('juego') );
    }
}
