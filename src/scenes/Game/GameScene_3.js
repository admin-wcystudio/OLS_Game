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

        this.load.image('confirm_button', `${path}game3_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game3_confirm_button_select.png`);


        this.load.image('game3_npc_box_mainstreet', `${path}game3_npc_box1.png`);
        this.load.image('game3_npc_box_win', `${path}game3_npc_box2.png`);
        this.load.image('game3_npc_box_tryagain', `${path}game3_npc_box3.png`);
        this.load.image('game3_select_area', `${path}game3_select_area.png`);


        this.load.image(`game3_q1_fill_correct_answer1`, `${path}game3_q1_fill_correct_answer1.png`);
        this.load.image(`game3_q1_fill_correct_answer2`, `${path}game3_q1_fill_correct_answer2.png`);
        this.load.image(`game3_q1_fill_fail_answer1`, `${path}game3_q1_fill_fail_answer1.png`);
        this.load.image(`game3_q1_fill_fail_answer2`, `${path}game3_q1_fill_fail_answer2.png`);


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
        this.initGame('game3_bg', 'game3_description', true, true, {
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
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });
        this.confirmBtn.setDepth(200).setVisible(true);

        // Debug: spawn positions (red)
        const debugGraphics = this.add.graphics().setDepth(200);
        debugGraphics.lineStyle(3, 0xff0000, 1);
        debugGraphics.fillStyle(0xff0000, 0.3);
        this.spawnPositions.forEach((pos, index) => {
            const radius = 40;
            debugGraphics.strokeCircle(pos.x, pos.y, radius);
            debugGraphics.fillCircle(pos.x, pos.y, radius);
            this.add.text(pos.x + radius + 5, pos.y - 10, `spawn[${index}]`, {
                fontSize: '18px', fill: '#ff0000'
            }).setDepth(201);
        });

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
                    { x: 1150, y: 580, targetKey: 'game3_q1_correct_answer2' }
                ]
            },
            {
                q: 2,
                fillPositions: [
                    { x: 950, y: 580, targetKey: 'game3_q2_correct_answer1' }
                ]
            },
            {
                q: 3,
                fillPositions: [
                    { x: 950, y: 580, targetKey: 'game3_q3_correct_answer1' }
                ]
            }
        ];

        // Debug: fill positions (cyan)
        const fillDebugGraphics = this.add.graphics().setDepth(202);
        fillDebugGraphics.lineStyle(3, 0x00ffff, 1);
        fillDebugGraphics.fillStyle(0x00ffff, 0.3);
        const currentFillPositions = this.targetContents[this.currentIndex - 1].fillPositions;
        currentFillPositions.forEach((slot, index) => {
            const radius = 40;
            fillDebugGraphics.strokeCircle(slot.x, slot.y, radius);
            fillDebugGraphics.fillCircle(slot.x, slot.y, radius);
            this.add.text(slot.x + radius + 5, slot.y - 10, `fill[${index}]\n${slot.targetKey}`, {
                fontSize: '14px', fill: '#00ffff'
            }).setDepth(203);
        });

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
                nearest.snapImage = this.add.image(nearest.x, nearest.y, fillKey).setDepth(200);
                gameObject.setVisible(false).disableInteractive();
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

        let isFinalWin = (this.currentIndex + 1 >= this.targetRounds) || this.isAllowRoundFail;
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        this.gameTimer.stop();
        this._calculateTiming(isFinalWin);
        this.enableGameInteraction(false);
        this.updateRoundUI(true);

        // Feedback Visuals
        this.showFeedbackLabel(true);
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

}
