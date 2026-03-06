import { GameStartScene } from './scenes/GameStartScene.js';
import { BootScene } from './scenes/BootScene.js';
import { LoginScene } from './scenes/LoginScene.js';
import { TransitionScene } from './scenes/TransitionScene.js';
import { MainStreetScene } from './scenes/MainStreetScene.js';
import { GameScene_1 } from './scenes/Game/GameScene_1.js';
import { GameResultScene } from './scenes/GameResultScene.js';
import { GameScene_2 } from './scenes/Game/GameScene_2.js';
import { GameScene_3 } from './scenes/Game/GameScene_3.js';
import { GameScene_4 } from './scenes/Game/GameScene_4.js';
import { GameScene_5 } from './scenes/Game/GameScene_5.js';
import { GameScene_6 } from './scenes/Game/GameScene_6.js';
import { GameScene_7 } from './scenes/Game/GameScene_7.js';



const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    width: 1920,
    height: 1080,
    backgroundColor: '#000000',
    preseveDrawingBuffer: true,
    pixelArt: false,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        BootScene,
        GameStartScene,
        LoginScene,
        TransitionScene,
        GameResultScene,
        MainStreetScene,
        GameScene_1,
        GameScene_2,
        GameScene_3,
        GameScene_4,
        GameScene_5,
        GameScene_6,
        GameScene_7
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
