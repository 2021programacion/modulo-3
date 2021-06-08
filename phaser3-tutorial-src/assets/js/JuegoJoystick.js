class Juego extends Phaser.Scene {
    constructor() {
        super('juego');
    }
    preload() {
        let url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
        this.load.plugin('rexvirtualjoystickplugin', url, true);
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
        this.joystick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: 400,
            y: 550,
            radius: 100,
            base: this.add.circle(0, 0, 50, 0x888888),
            thumb: this.add.circle(0, 0, 15, 0xcccccc),
            // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
            // forceMin: 16,
            // enable: true
        })
        .on('update', this.dumpJoyStickState, this);

        this.text = this.add.text(0, 0);
        this.dumpJoyStickState();


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

        sounds.death = this.sound.add("death");
        sounds.run = this.sound.add("run");
        sounds.pick = this.sound.add("pick");
    }

    update() {
        if (gameOver) {
            stopSound(sounds.run);
            return;
        }

        if (cursors.left.isUp || cursors.right.isUp) {
            stopSound(sounds.run);
        }

        var leftKeyDown = this.joystick.left;
        var rightKeyDown = this.joystick.right;
        var upKeyDown = this.joystick.up;
        var downKeyDown = this.joystick.down;
        var noKeyDown = this.joystick.noKey;


        if (cursors.left.isDown || leftKeyDown) {
            this.moveLeft();
        }
        else {
            if (cursors.right.isDown || rightKeyDown) {
                this.moveRight();
            }
            else {
                this.stopMove();
            }
        }

        if ((cursors.up.isDown || upKeyDown) && player.body.touching.down) {
            this.moveUp();
        }

    }

    dumpJoyStickState() {
        var cursorKeys = this.joystick.createCursorKeys();
        var s = 'Key down: ';
        for (var name in cursorKeys) {
            if (cursorKeys[name].isDown) {
                s += name + ' ';
            }
        }
        s += '\n';
        s += ('Force: ' + Math.floor(this.joystick.force * 100) / 100 + '\n');
        s += ('Angle: ' + Math.floor(this.joystick.angle * 100) / 100 + '\n');
        //this.text.setText(s);
    }

    moveLeft() {
        player.setVelocityX(-160);
        playSound(sounds.run);
        player.anims.play('left', true);
    }

    moveRight() {
        player.setVelocityX(160);
        playSound(sounds.run);
        player.anims.play('right', true);
    }

    moveUp() {
        player.setVelocityY(-330);
        player.anims.play('jump');
    }

    stopMove() {
        player.setVelocityX(0);
        player.anims.play('turn');
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