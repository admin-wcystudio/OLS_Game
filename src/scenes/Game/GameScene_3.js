import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_3 extends BaseGameScene {
    constructor() {
        super('GameScene_3');
    }

    preload() {
        const path = 'assets/images/Game_3/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2

        this.load.image('game3_confirm_button', `${path}game3_confirm_button.png`);
        this.load.image('game3_confirm_button_select', `${path}game3_confirm_button_select.png`);


        this.load.image('game3_npc_box_mainstreet', `${path}game3_npc_box1.png`);
        this.load.image('game3_npc_box_win', `${path}game3_npc_box2.png`);
        this.load.image('game3_npc_box_tryagain', `${path}game3_npc_box3.png`);
        this.load.image('game3_select_area', `${path}game3_select_area.png`);

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game3_q${i}`, `${path}game3_q${i}.png`);
            this.load.image(`game3_q${i}_correct_answer1`, `${path}game3_q${i}_correct_answer1.png`);
            if (i == 1)
                this.load.image(`game3_q${i}_correct_answer2`, `${path}game3_q${i}_correct_answer2.png`);
            this.load.image(`game3_q${i}_fail_answer1`, `${path}game3_q${i}_fail_answer1.png`);
            this.load.image(`game3_q${i}_fail_answer2`, `${path}game3_q${i}_fail_answer2.png`);
            if (i != 1)
                this.load.image(`game3_q${i}_fail_answer3`, `${path}game3_q${i}_fail_answer3.png`);

            this.load.image(`game3_q${i}_description`, `${path}game3_q${i}_description.png`);
            for (let j = 1; j <= 4; j++) {
                this.load.image(`game3_q${i}_fill_answer${j}`, `${path}game3_q${i}_fill_answer${j}.png`);
            }
        }

    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;


        this.spawnPositions = [
            { x: this.centerX - 800, y: this.centerY },
            { x: this.centerX + 800, y: this.centerY },
            { x: this.centerX - 800, y: this.centerY + 200 },
            { x: this.centerX + 800, y: this.centerY + 200 },
        ];

        this.currentIndex = 1;

        // Now call initGame which will call setupGameObjects
        this.initGame('game3_bg', 'game3_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 3
        });

    }

    setupGameObjects() {
        this.input.removeAllListeners('drag');
        this.input.removeAllListeners('dragend');

        this.questionImage = this.add.image(this.centerX,
            this.centerY + 50, `game3_q${this.currentIndex}`).setDepth(200);

        this.confirmBtn = new CustomButton(this, this.centerX, this.centerY + 450,
            'game3_confirm_button', 'game3_confirm_button_select', () => {
                this.checkAnswer();
            });
        this.confirmBtn.setDepth(200).setVisible(true);

        this.choices = [
            {
                q: 1,
                answers: ['game3_q1_correct_answer1', 'game3_q1_correct_answer2', 'game3_q1_fail_answer1', 'game3_q1_fail_answer2'],
                fillAnswers: ['game3_q1_fill_answer1', 'game3_q1_fill_answer4', 'game3_q1_fill_answer3', 'game3_q1_fill_answer2']
            },
            {
                q: 2,
                answers: ['game3_q2_correct_answer1', 'game3_q2_fail_answer1', 'game3_q2_fail_answer2', 'game3_q2_fail_answer3'],
                fillAnswers: ['game3_q2_fill_answer1', 'game3_q2_fill_answer2', 'game3_q2_fill_answer3', 'game3_q2_fill_answer4']
            },
            {
                q: 3,
                answers: ['game3_q3_correct_answer1', 'game3_q3_fail_answer1', 'game3_q3_fail_answer2', 'game3_q3_fail_answer3'],
                fillAnswers: ['game3_q3_fill_answer1', 'game3_q3_fill_answer2', 'game3_q3_fill_answer3', 'game3_q3_fill_answer4']
            }
        ];

        this.targetContents = [
            {
                q: 1,
                fillPositions: [
                    { x: 850, y: 580, targetKey: 'game3_q1_correct_answer1' },
                    { x: 1125, y: 580, targetKey: 'game3_q1_correct_answer2' }
                ]
            },
            {
                q: 2,
                fillPositions: [
                    { x: 1050, y: 580, targetKey: 'game3_q2_correct_answer1' }
                ]
            },
            {
                q: 3,
                fillPositions: [
                    { x: 980, y: 580, targetKey: 'game3_q3_correct_answer1' }
                ]
            }
        ];

        const currentFillPositions = this.targetContents[this.currentIndex - 1].fillPositions;

        // // Debug graphics for fill positions
        // if (!this.fillDebugGraphics) {
        //     this.fillDebugGraphics = this.add.graphics();
        // }
        // this.fillDebugGraphics.clear();
        // this.fillDebugGraphics.setDepth(250);
        // this.fillDebugGraphics.lineStyle(3, 0x00ff00, 1); // Green border
        // this.fillDebugGraphics.fillStyle(0x00ff00, 0.3); // Semi-transparent green fill

        // currentFillPositions.forEach((slot, index) => {
        //     const radius = 60;
        //     this.fillDebugGraphics.strokeCircle(slot.x, slot.y, radius);
        //     this.fillDebugGraphics.fillCircle(slot.x, slot.y, radius);
        //     this.add.text(slot.x + radius + 5, slot.y - 10, `fill[${index}]\n${slot.targetKey}`, {
        //         fontSize: '14px', fill: '#00ffff', backgroundColor: '#000000'
        //     }).setDepth(251);
        // });

        // Build answerKey → fillAnswerKey lookup
        const choice = this.choices[this.currentIndex - 1];
        const answerToFillMap = {};
        choice.answers.forEach((key, i) => { answerToFillMap[key] = choice.fillAnswers[i]; });

        // Build fill slots with invisible hint images
        const snapTolerance = 100;
        this.fillSlots = currentFillPositions.map(slot => ({
            x: slot.x,
            y: slot.y,
            targetKey: slot.targetKey,
            occupiedBy: null,
            hintImage: this.add.image(slot.x, slot.y, 'game3_select_area')
                .setDepth(199).setAlpha(0),
            snapImage: null
        }));

        // Spawn answers at shuffled positions
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnPositions]);
        this.answerImages = [];
        choice.answers.forEach((answerKey, index) => {
            const pos = shuffledPositions[index];
            const fillKey = answerToFillMap[answerKey];
            const img = this.add.image(pos.x, pos.y, answerKey)
                .setDepth(200)
                .setInteractive({ draggable: true, useHandCursor: true });
            img.setData({ answerKey, fillKey, originX: pos.x, originY: pos.y });
            this.answerImages.push(img);
        });

        // Drag: move image and show hint on nearby empty slots
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.setPosition(dragX, dragY).setDepth(300);
            const fillKey = gameObject.getData('fillKey');
            this.fillSlots.forEach(slot => {
                if (slot.occupiedBy) return;
                const dist = Phaser.Math.Distance.Between(dragX, dragY, slot.x, slot.y);
                if (dist < snapTolerance) {
                    slot.hintImage.setTexture(fillKey).setAlpha(0.6);
                } else {
                    slot.hintImage.setAlpha(0);
                }
            });
        });

        // Drag end: snap to nearest slot or return to origin
        this.input.on('dragend', (pointer, gameObject) => {
            this.fillSlots.forEach(slot => slot.hintImage.setAlpha(0));

            const answerKey = gameObject.getData('answerKey');
            const fillKey = gameObject.getData('fillKey');

            let nearest = null;
            let nearestDist = snapTolerance;
            this.fillSlots.forEach(slot => {
                if (slot.occupiedBy) return;
                const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, slot.x, slot.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = slot;
                }
            });

            if (nearest) {
                nearest.occupiedBy = answerKey;
                nearest.snapImage = this.add.image(nearest.x, nearest.y, fillKey)
                    .setDepth(200)
                    .setInteractive({ useHandCursor: true });

                // Store reference to original image for later restoration
                nearest.originalImage = gameObject;
                gameObject.setVisible(false).disableInteractive();

                // Click on placed answer to remove it and restore original
                nearest.snapImage.once('pointerdown', () => {
                    // Restore original image to spawn position
                    gameObject.setVisible(true);
                    gameObject.setInteractive({ draggable: true, useHandCursor: true });
                    gameObject.setPosition(
                        gameObject.getData('originX'),
                        gameObject.getData('originY')
                    ).setDepth(200);

                    // Clear slot
                    nearest.snapImage.destroy();
                    nearest.snapImage = null;
                    nearest.occupiedBy = null;
                    nearest.originalImage = null;
                });
            } else {
                gameObject.setPosition(
                    gameObject.getData('originX'),
                    gameObject.getData('originY')
                ).setDepth(200);
            }
        });
    }


    checkAnswer() {
        const allCorrect = this.fillSlots.every(slot => slot.occupiedBy === slot.targetKey);
        if (allCorrect) {
            this.onRoundWin();
        } else {
            this.handleLose();
        }
    }

    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        let isFinalWin = (this.currentIndex == this.targetRounds);
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        // Sync roundIndex with currentIndex for UI updates
        this.roundIndex = this.currentIndex - 1;

        if (isFinalWin) {
            this.gameTimer.stop();
            this._calculateTiming(isFinalWin);
            this.enableGameInteraction(false);
            this.showFeedbackLabel(true);
        }
        this.updateRoundUI(true);
        this.showDescriptionPanel();
    }

    showDescriptionPanel() {
        this.descriptionPanel = new CustomPanel(this, this.centerX, this.centerY, [{
            content: `game3_q${this.currentIndex}_description`,
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        this.descriptionPanel.setDepth(1000);
        this.descriptionPanel.show();
        this.descriptionPanel.setCloseCallBack(() => {
            if (this.gameState === 'roundWin') {
                this.currentIndex++;
                this.resetForNewRound();
            } else {
                this.showBubble('win');
            }
        });
    }

    enableGameInteraction(enabled) {
        if (!this.answerImages) return;
        this.answerImages.forEach(img => {
            if (!img.active) return;
            if (enabled) {
                img.setInteractive({ draggable: true, useHandCursor: true });
            } else {
                img.disableInteractive();
            }
        });

        this.confirmBtn.setVisible(enabled);
    }

    resetForNewRound() {
        // Destroy question image
        if (this.questionImage) { this.questionImage.destroy(); this.questionImage = null; }

        // Destroy confirm button
        if (this.confirmBtn) { this.confirmBtn.destroy(); this.confirmBtn = null; }

        // Destroy answer images
        if (this.answerImages) {
            this.answerImages.forEach(img => img.destroy());
            this.answerImages = [];
        }

        // Destroy fill slot hint/snap images
        if (this.fillSlots) {
            this.fillSlots.forEach(slot => {
                if (slot.hintImage) slot.hintImage.destroy();
                if (slot.snapImage) slot.snapImage.destroy();
            });
            this.fillSlots = [];
        }

        this.setupGameObjects();

        // Reset game state for new round
        this.gameState = 'playing';
        this.isGameActive = true;
        this.gameTimer.start();
        this.enableGameInteraction(true);
    }

    onWinBubbleClose() {
        GameManager.backToMainStreet(this);
    }
}
