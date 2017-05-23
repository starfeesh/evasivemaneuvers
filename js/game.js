var stage, queue, player, obstacles=[], launchpad;
var meteorSS, explosionSS;
var keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
};
var settings = {
    playerSpeed: 8,
    lives: 1,
    level: 1
};
var lanes = [
    {
        obstacleCount: 4,
        obstacleSpeed:5,
        position: 125
    },
    {
        obstacleCount: 6,
        obstacleSpeed: 3,
        position: 175
    },
    {
        obstacleCount: 6,
        obstacleSpeed: 5,
        position: 225
    }
];
function preload(){
    stage = new createjs.Stage("myCanvas");

    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on('complete', setup);

    queue.loadManifest(
        [
            {id: "spaceshipSS", src: "assets/json/spaceship.json"},
            {id: "meteorSS", src: "assets/json/meteor.json"},
            {id: "explosionSS", src: "assets/json/explosion.json"},
            {id: "explosionSound", src: "assets/audio/Explosion+1.mp3"}
        ]
    );
}
function setup(){
    "use strict";
    var spaceshipSS = new createjs.SpriteSheet(queue.getResult("spaceshipSS"));
    meteorSS = new createjs.SpriteSheet(queue.getResult("meteorSS"));
    explosionSS = new createjs.SpriteSheet(queue.getResult("explosionSS"));

    launchpad = new createjs.Bitmap("assets/img/platform_6x1.png");
    launchpad.width = 242;
    launchpad.height = 42;
    launchpad.x = stage.canvas.width / 2 - launchpad.width / 2;
    launchpad.y = stage.canvas.height - launchpad.height;
    stage.addChild(launchpad);
    player = new createjs.Sprite(spaceshipSS, "down");
    player.gotoAndPlay('idle');
    player.currentDirection = "";
    player.rotation = 90;
    player.isAlive = true;
    player.landed = false;
    player.width = 42;
    player.height = 42;
    player.x = stage.canvas.width / 2;
    player.y = player.height;
    stage.addChild(player);

    addObstacles();

    window.addEventListener('keyup', keyLifted);
    window.addEventListener('keydown', keyPressed);

    createjs.Ticker.setFPS(15);
    createjs.Ticker.addEventListener('tick', updateStage);
}

function keyLifted(e) {
    player.gotoAndPlay('idle');
    switch (e.keyCode) {
        case 32:
            keys.space = false;
            break;
        case 37:
            keys.left = false;
            break;
        case 38:
            keys.up = false;
            break;
        case 39:
            keys.right = false;
            break;
        case 40:
            keys.down = false;
            break;
    }
}

function keyPressed(e) {
    switch (e.keyCode) {
        case 32:
            keys.space = true;
            break;
        case 37:
            keys.left = true;
            break;
        case 38:
            keys.up = true;
            break;
        case 39:
            keys.right = true;
            break;
        case 40:
            keys.down = true;
            break;
    }
}
function movePlayer() {
    if (keys.left) {
        if(player.x < player.width / 2)
        {
            player.x = player.width / 2;
        }
        player.x-=settings.playerSpeed;
        if (player.currentDirection != "left") {
            player.currentDirection = "left";
            player.rotation = 180;
            player.gotoAndPlay('fly');
        }
    }
    if (keys.right) {
        if (player.x > stage.canvas.width - player.width / 2) {
            player.x = stage.canvas.width - player.width /2;
        }
        player.x+=settings.playerSpeed;
        if (player.currentDirection != "right") {
            player.currentDirection = "right";
            player.rotation = 0;
            player.gotoAndPlay('fly');
        }
    }
    if (keys.up) {
        if (player.y < player.height / 2) {
            player.y = player.height / 2;
        }
        player.y-=settings.playerSpeed;
        if (player.currentDirection != "up") {
            player.currentDirection = "up";
            player.rotation = -90;
            player.gotoAndPlay('fly');
        }

    }
    if (keys.down) {
        if (player.y > stage.canvas.height - player.height / 2){
            player.y = stage.canvas.height - player.height / 2;
        }
        player.y+=settings.playerSpeed;
        if (player.currentDirection != "down") {
            player.currentDirection = "down";
            player.rotation = 90;
            player.gotoAndPlay('fly');
        }
    }
}
function endLevel() {
    window.removeEventListener('keydown', keyPressed);
    createjs.Tween.get(player)
        .to({x: stage.canvas.width / 2, y: stage.canvas.height - player.height * 2, rotation: -90}, 250)
        .to({y: stage.canvas.height - 52}, 2000).wait(1000).call(nextLevel);

}
function nextLevel() {
    window.addEventListener('keydown', keyPressed);
    settings.level++;

    player.x = stage.canvas.width / 2;
    player.y = player.height;
    player.rotation = 90;
    player.landed = false;

    var text = new createjs.Text("Level " + settings.level, "20px Arial", "#fff");
    text.x = -50;
    text.y = -50;
    text.textAlign = "center";
    text.textBaseline = "middle";
    stage.addChild(text);

    createjs.Tween.get(text)
        .to({x: stage.canvas.width / 2, y: stage.canvas.height / 2}, 2000, createjs.Ease.backOut).wait(1000)
        .to({x: stage.canvas.width + 50, y: -50}, 2000, createjs.Ease.backIn);


    for (var i = 0; i < lanes.length; i++) {
        lanes[i].obstacleSpeed += 1.2;
    }

}

function addObstacles() {
    lanes.forEach(function (current, index) {
        for (var j = 0; j < lanes[index].obstacleCount; j++) {
            var temp = new createjs.Sprite(meteorSS, "meteor");
            temp.width = 32;
            temp.height = 32;
            temp.x = Math.floor(Math.random()*800+1) + Math.floor(Math.random()*(90 - 45) + 45);
            temp.y = lanes[index].position;
            stage.addChild(temp);
            obstacles.push(temp);

        }
    });

    for (var i = 0; i < obstacles.length; i++) {
        createjs.Tween.get(obstacles[i], {loop: true})
            .to({rotation: 360}, Math.floor(Math.random()*(4000 - 1000) + 1000));
    }
}
function moveObstacles() {
    for (var i = obstacles.length - 1; i >= 0; i--) {
        for (var j = 0; j < lanes.length; j++){
            if (obstacles[i].y == lanes[j].position) {
                obstacles[i].x += lanes[j].obstacleSpeed;
            }

            if (obstacles[i].x > stage.canvas.width) {
                obstacles[i].x = -50;
            }
        }
    }
}
function hitTest(rect1, rect2) {
    if (rect1.x >= rect2.x + rect2.width
    || rect1.x + rect1.width <= rect2.x
    || rect1.y >= rect2.y + rect2.height
    || rect1.y + rect1.height <= rect2.y) {
        return false;
    }
    return true;
}
function handleCollisions() {
    // Obstacle / Player collision
    for (var i = obstacles.length -1; i >= 0; i--) {
        if (hitTest(player, obstacles[i])){
            if (settings.lives = 1 && player.isAlive){
                explode();
                createjs.Sound.play("explosionSound");
                stage.removeChild(player);
                player.isAlive = false;
            }
            settings.lives--;
        }
    }

    // Player / Launchpad collision
    if (hitTest(player, launchpad) && !player.landed) {
        endLevel();
        player.landed = true;
    }

}
function explode()
{
    var explosion = new createjs.Sprite(explosionSS, "explo");
    stage.addChild(explosion);
    explosion.x = player.x;
    explosion.y = player.y;
    explosion.addEventListener('animationend', function () {
        stage.removeChild(explosion);
        gameOver();
    })
}
function gameOver() {

    var text = new createjs.Text("Game Over", "42px Arial", "#fff");
    text.x = stage.canvas.width / 2;
    text.y = stage.canvas.height / 2;
    text.textAlign = "center";
    text.textBaseline = "middle";
    stage.addChild(text);

}
function updateStage(e){
    moveObstacles();
    movePlayer();
    handleCollisions();
    stage.update(e);
}
window.addEventListener('load', preload);