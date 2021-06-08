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
var sounds = {};
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