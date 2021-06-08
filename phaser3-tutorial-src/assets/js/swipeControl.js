const LEFT = 4;
const RIGHT = 6;
const UP = 2;
const DOWN = 8;
const LEFT_UP = 1;
const LEFT_DOWN = 7;
const RIGHT_UP = 3;
const RIGHT_DOWN = 9;

//1 2 3
//4 x 6
//7 8 9

const handleKey = function (e, callback) {
    let keyPressed = e.code;
    console.log(`You pressed key # ${keyPressed}`);
    if (this.canMove) {
        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                callback(LEFT);
                break;
            case 'KeyD':
            case 'ArrowRight':
                callback(RIGHT);
                break;
            case 'KeyW':
            case 'ArrowUp':
                callback(UP);
                break;
            case 'KeyS':
            case 'ArrowDown':
                callback(DOWN);
                break;
        }
    }
}

const handleSwipe = function (e, callback) {
    if (this.canMove) {
        let swipeTime = e.upTime - e.downTime;
        let fastEnough = swipeTime < gameOptions.swipeMaxTime;
        let swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
        let swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
        let longEnough = swipeMagnitude > gameOptions.swipeMinDistance;
        console.log(`Movement time ${swipeTime} ms`);
        console.log(`Horizontal distance: ${swipe.x} px`);
        console.log(`Vertical distance: ${swipe.y} px`);

        if (longEnough && fastEnough) {
            Phaser.Geom.Point.setMagnitude(swipe, 1);//Normaliza el vector
            if (swipe.x > gameOptions.swipeMinNormal) {
                callback(RIGHT);
            }
            if (swipe.x < -gameOptions.swipeMinNormal) {
                callback(LEFT);
            }
            if (swipe.y > gameOptions.swipeMinNormal) {
                callback(DOWN);
            }
            if (swipe.y < -gameOptions.swipeMinNormal) {
                callback(UP);
            }
        }


    }
}