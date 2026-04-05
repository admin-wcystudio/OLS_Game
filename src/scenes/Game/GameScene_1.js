import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_1 extends BaseGameScene {
    constructor() {
        super('GameScene_1');
    }
    preload() {
        const path = 'assets/images/Game_1/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.load.image('game1_npc_box_mainstreet', `${path}game1_npc_box1.png`);
        this.load.image('game1_npc_box_intro', `${path}game1_npc_box2.png`);
        this.load.image('game1_npc_box_win', `${path}game1_npc_box3.png`);
        this.load.image('game1_npc_box_tryagain', `${path}game1_npc_box4.png`);
        this.load.image('game1_rotate', `${path}game1_rotate.png`);
        this.load.image('game1_object_description', `${path}game1_object_description.png`);

        this.load.image('game1_puzzle_guide', `${path}game1_puzzle_guide.png`);

        for (let i = 1; i <= 6; i++) {
            this.load.image(`game1_puzzle${i}`, `${path}game1_puzzle${i}.png`);
        }

        this.gender = 'F';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }

        this.load.spritesheet('game1_success_preview',
            `${path}game1_success_preview.png`, {
            frameWidth: 164.5,
            frameHeight: 230
        });

    }

    create() {
        this.initGame('game1_bg', 'game1_description', false, false, {
            targetRounds: 1,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 1
        });
        this.anims.create({
            key: 'success_preview_anim',
            frames: this.anims.generateFrameNumbers('game1_success_preview', { start: 0, end: 48 }),
            framerate: 30,
            repeat: -1
        });

    }
    setupGameObjects() {
        this.selectedPuzzle = null;

        if (this.guide) this.guide.destroy();
        if (this.rotateButton) this.rotateButton.destroy();
        this.input.removeAllListeners('drag');
        this.input.removeAllListeners('dragend');

        const centerX = this.cameras.main.width / 2;
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const defaultPuzzles = [
            { content: 'game1_puzzle1', targetX: centerX - 100, targetY: 260 },
            { content: 'game1_puzzle2', targetX: centerX + 100, targetY: 260 },
            { content: 'game1_puzzle3', targetX: centerX - 100, targetY: 460 },
            { content: 'game1_puzzle4', targetX: centerX + 100, targetY: 460 },
            { content: 'game1_puzzle5', targetX: centerX - 100, targetY: 660 },
            { content: 'game1_puzzle6', targetX: centerX + 100, targetY: 660 }
        ];

        this.puzzleGroup = this.add.group();


        this.guide = this.add.image(centerX, 460, 'game1_puzzle_guide').setDepth(10);

        defaultPuzzles.forEach(data => {
            let piece = this.add.image(0, 0, data.content).setDepth(50);
            piece.setData({ targetX: data.targetX, targetY: data.targetY, isCorrect: false });
            piece.on('pointerdown', () => this.selectPuzzle(piece));
            this.puzzleGroup.add(piece);
        });

        this.randomPuzzlePosition(this.puzzleGroup.getChildren());

        // 旋轉按鈕
        this.rotateButton = new CustomButton(this, width - 200, height - 200, 'game1_rotate', null, () => {
            if (this.selectedPuzzle) this.selectedPuzzle.angle += 90;
        }).setDepth(100);

        // 拖拽事件 (搬移到這裡確保只設定一次)
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.selectedPuzzle !== gameObject) this.selectPuzzle(gameObject);
            gameObject.setPosition(dragX, dragY).setDepth(100);
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setDepth(50);
            this.checkSnap(gameObject);
        });


        //==== Debug Graphics ===========================================================
        // const debugGraphics = this.add.graphics().setDepth(2); // 擺喺背景上面，物件下面
        // debugGraphics.lineStyle(3, 0xff0000, 1); // 紅色線，粗度 2

        // defaultPuzzles.forEach(data => {
        //     const rectSize = 200;
        //     const startX = data.targetX - rectSize / 2;
        //     const startY = data.targetY - rectSize / 2;

        //     // 畫出目標區域矩形
        //     debugGraphics.strokeRect(startX, startY, rectSize, rectSize);

        //     // 喺方框旁邊寫低係邊塊 Puzzle，方便對號入座
        //     this.add.text(startX, startY - 20, data.content, {
        //         fontSize: '16px',
        //         fill: '#ff0000'
        //     }).setDepth(1);
        // });

        // const tolerance = 60; // 同你 checkSnap 裡面個數值一樣
        // defaultPuzzles.forEach(data => {
        //     debugGraphics.lineStyle(1, 0x00ff00, 0.5); // 綠色虛線感
        //     debugGraphics.strokeCircle(data.targetX, data.targetY, tolerance);
        // });
    }
    /**
     * 控制拼圖是否可被操作
     */
    enableGameInteraction(enabled) {
        this.puzzleGroup.getChildren().forEach(p => {
            if (enabled) {
                p.setInteractive({ draggable: true, useHandCursor: true });
            } else {
                p.disableInteractive();
            }
        });
        this.guide.setVisible(enabled);
    }


    // --- 拼圖專用邏輯 (保持不變) ---

    selectPuzzle(piece) {
        if (this.selectedPuzzle) {
            this.selectedPuzzle.clearTint();
        }
        this.selectedPuzzle = piece;
        piece.setTint(0xaaaaaa);
    }

    checkSnap(piece) {
        const { targetX, targetY } = piece.data.values;
        const dist = Phaser.Math.Distance.Between(piece.x, piece.y, targetX, targetY);
        const isAngleCorrect = (piece.angle % 360 === 0);

        if (dist < 60 && isAngleCorrect) {
            piece.setPosition(targetX, targetY).setData('isCorrect', true).disableInteractive().clearTint();
            this.checkAllDone();
        }
    }

    randomPuzzlePosition(puzzles) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const allowedRotations = [0, 90, 180, 270];

        puzzles.forEach(puzzle => {
            puzzle.setPosition(centerX + Phaser.Math.Between(-400, 400), centerY + Phaser.Math.Between(-300, 100));
            puzzle.setAngle(Phaser.Utils.Array.GetRandom(allowedRotations));
        });
    }

    checkAllDone() {
        const allCorrect = this.puzzleGroup.getChildren().every(p => p.getData('isCorrect'));
        if (allCorrect) {
            console.log("所有拼圖完成!");
            this.onRoundWin();
        }
    }

    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        let isFinalWin = (this.roundIndex + 1 >= this.targetRounds) || this.isAllowRoundFail;
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        this.gameTimer.stop();
        this._calculateTiming(isFinalWin);
        this.enableGameInteraction(false);
        this.updateRoundUI(true);

        // Feedback Visuals
        this.showFeedbackLabel(true);
        this.showBubble('win', this.playerGender);
        this.playFeedback();
    }

    playFeedback() {
        this.puzzleGroup.setVisible(false);
        if (this.successVideo) this.successVideo.destroy();

        this.previewSprite = this.add.sprite(960, 440,
            'game1_success_preview').setDepth(1000).setScale(2);
        this.previewSprite.play('success_preview_anim');
    }

    showWin() {
        this.showObjectPanel();
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game1_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }


    /**
     * 重置每一局的拼圖狀態
     */
    resetForNewRound() {
        this.puzzleGroup.setVisible(true);
        this.puzzleGroup.getChildren().forEach(p => p.setData('isCorrect', false));
        this.randomPuzzlePosition(this.puzzleGroup.getChildren());
    }



}