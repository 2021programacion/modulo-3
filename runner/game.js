let game;

let config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1366,
        height: 768,
      },
    
    scene: [playGame],
    backgroundColor: 0x444444,

    // physics settings
    physics: {
        default: "arcade"
    }
}

game = new Phaser.Game(config);

// global game options
let gameOptions = {
    platformStartSpeed: 350,
    spawnRange: [100, 350],
    platformSizeRange: [50, 250],
    playerGravity: 900,
    jumpForce: 400,
    playerStartPosition: 200,
    jumps: 2
}
