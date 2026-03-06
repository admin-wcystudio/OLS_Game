
import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_7 extends BaseGameScene {
    constructor() {
        super('GameScene_7');
    }

    preload() {
        const path = 'assets/images/Game_7/';
        const player = JSON.parse(localStorage.getItem('player') || '{"gender":"M"}');
        this.genderKey = player.gender === 'M' ? 'boy' : 'girl';

        this.load.image('confirm_button', `${path}game7_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game7_confirm_button_select.png`);


        for (let i = 1; i <= 6; i++) {
            this.load.image(`game7_answer${i}`, `${path}game7_answer${i}.png`);
            this.load.image(`game7_fill_answer${i}`, `${path}game7_fill_answer${i}.png`);
        }

        this.load.video('game7_final_boybg1', `${path}game7_final_boybg1.webm`);
        this.load.video('game7_final_boybg2', `${path}game7_final_boybg2.webm`);
        this.load.video('game7_final_girlbg1', `${path}game7_final_girlbg1.webm`);
        this.load.video('game7_final_girlbg2', `${path}game7_final_girlbg2.webm`);

        this.load.image('game7_npc_box_intro', `${path}game7_npc_box5.png`);

        this.load.image('game7_npc_box_tryagain', `${path}game7_npc_box8.png`);

        this.load.image('game7_npc_box_win1', `${path}game7_npc_box1.png`);
        this.load.image('game7_npc_box_win2', `${path}game7_npc_box2.png`);

        this.load.image('game7_boy_feedback', `${path}game7_npc_boy_box6.png`);
        this.load.image('game7_girl_feedback', `${path}game7_npc_girl_box6.png`);
        this.load.image('game7_npc_box_feedback', `${path}game7_npc_box7.png`);

        this.load.image('final_preview', `${path}game7_final_preview.png`);
        this.load.image('select_area', `${path}game7_select_area.png`);
        this.load.image('game7_border', `${path}game7_border.png`);


    }

    create() {
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.spawnPositions = [
            { x: this.centerX - 800, y: this.centerY - 150 },
            { x: this.centerX - 800, y: this.centerY + 350 },
            { x: this.centerX - 800, y: this.centerY + 100 },
            { x: this.centerX + 800, y: this.centerY - 150 },
            { x: this.centerX + 800, y: this.centerY + 100 },
            { x: this.centerX + 800, y: this.centerY + 350 },
        ];



        this.confirmBtn = new CustomButton(this, this.centerX, this.height - 150,
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });
        this.confirmBtn.setDepth(100).setVisible(false);

        this.initGame('game7_bg', 'game7_description', false, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 7
        });

    }

    setupGameObjects() {
        this.content = this.add.image(this.centerX, this.centerY, 'game7_border').setDepth(1);

        this.targetContents = [
            {
                key: 'game7_answer1', fillKey: 'game7_fill_answer1'
                , position: { x: this.centerX - 75, y: this.centerY - 250 }
            },
            {
                key: 'game7_answer5', fillKey: 'game7_fill_answer5',
                position: { x: this.centerX - 100, y: this.centerY - 100 }
            },
            {
                key: 'game7_answer4', fillKey: 'game7_fill_answer4', position:
                    { x: this.centerX + 60, y: this.centerY + 80 }
            },
            {
                key: 'game7_answer6', fillKey: 'game7_fill_answer6', position:
                    { x: this.centerX + 410, y: this.centerY - 100 }
            },
            {
                key: 'game7_answer3', fillKey: 'game7_fill_answer3', position:
                    { x: this.centerX + 200, y: this.centerY + 175 }
            },
            {
                key: 'game7_answer2', fillKey: 'game7_fill_answer2', position:
                    { x: this.centerX + 500, y: this.centerY + 175 }
            },
        ];

        // --- 1. Create fill slots – select_area indicator only, hidden by default, no hint texture ---
        this.fillSlots = this.targetContents.map(tc => {
            const selectArea = this.add.image(tc.position.x, tc.position.y, 'select_area')
                .setDepth(500)
                .setVisible(false);
            return {
                selectArea,
                fillKey: tc.fillKey,
                targetKey: tc.key,
                position: tc.position,
                occupiedBy: null,
            };
        });

        // --- 2. Randomize spawn positions and create draggable answer keys ---
        const answerKeys = ['game7_answer1', 'game7_answer2', 'game7_answer3', 'game7_answer4', 'game7_answer5', 'game7_answer6'];
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnPositions]);

        this.answerKeyObjects = [];
        const SNAP_RADIUS = 120;

        answerKeys.forEach((key, i) => {
            const pos = shuffledPositions[i];
            const img = this.add.image(pos.x, pos.y, key)
                .setDepth(10)
                .setInteractive({ draggable: true });

            img.answerKey = key;
            img.fillKey = key.replace('game7_answer', 'game7_fill_answer');
            img.originalX = pos.x;
            img.originalY = pos.y;
            img.currentSlot = null;

            // drag – move with pointer; highlight nearest slot within range
            img.on('drag', (pointer, dragX, dragY) => {
                img.x = dragX;
                img.y = dragY;
                img.setDepth(20);

                // Show select_area only for the closest empty-or-current slot within range
                let closestSlot = null;
                let closestDist = SNAP_RADIUS;
                this.fillSlots.forEach(slot => {
                    // Don't highlight a slot already occupied by another key
                    if (slot.occupiedBy && slot.occupiedBy !== img.answerKey) return;
                    const dist = Phaser.Math.Distance.Between(dragX, dragY, slot.position.x, slot.position.y);
                    if (dist < closestDist) { closestDist = dist; closestSlot = slot; }
                });

                this.fillSlots.forEach(slot => {
                    slot.selectArea.setVisible(slot === closestSlot);
                });
            });

            // dragend – snap to nearest slot or return to origin
            img.on('dragend', () => {
                // Hide all select_area indicators
                this.fillSlots.forEach(slot => slot.selectArea.setVisible(false));

                let closestSlot = null;
                let closestDist = SNAP_RADIUS;
                this.fillSlots.forEach(slot => {
                    if (slot.occupiedBy && slot.occupiedBy !== img.answerKey) return;
                    const dist = Phaser.Math.Distance.Between(img.x, img.y, slot.position.x, slot.position.y);
                    if (dist < closestDist) { closestDist = dist; closestSlot = slot; }
                });

                if (closestSlot) {
                    // Evict any key already in that slot – revert its texture and send it home
                    if (closestSlot.occupiedBy && closestSlot.occupiedBy !== img.answerKey) {
                        const prev = this.answerKeyObjects.find(a => a.answerKey === closestSlot.occupiedBy);
                        if (prev) {
                            prev.setTexture(prev.answerKey);
                            prev.clearTint();
                            prev.x = prev.originalX;
                            prev.y = prev.originalY;
                            prev.setDepth(10);
                            prev.currentSlot = null;
                        }
                    }

                    // Revert the slot this key was previously in
                    if (img.currentSlot) {
                        img.currentSlot.occupiedBy = null;
                    }

                    // Snap into the new slot and switch to the dragged key's fill texture
                    img.x = closestSlot.position.x;
                    img.y = closestSlot.position.y;
                    img.setDepth(505);
                    img.setTexture(img.fillKey);
                    closestSlot.occupiedBy = img.answerKey;
                    img.currentSlot = closestSlot;

                } else {
                    // Return to spawn origin and restore original texture
                    if (img.currentSlot) {
                        img.currentSlot.occupiedBy = null;
                        img.currentSlot = null;
                    }
                    img.setTexture(img.answerKey);
                    // img.clearTint();
                    img.x = img.originalX;
                    img.y = img.originalY;
                    img.setDepth(10);
                }

                // After every drop, refresh tint feedback on all filled slots
                //  this._updateSlotTints();
            });

            console.log(`Created answer key: ${key} at (${pos.x}, ${pos.y})`);

            this.answerKeyObjects.push(img);
        });


    }

    // Tint each snapped key: green = correct slot, red = wrong slot
    _updateSlotTints() {
        this.fillSlots.forEach(slot => {
            if (!slot.occupiedBy) return;
            const img = this.answerKeyObjects.find(a => a.answerKey === slot.occupiedBy);
            if (!img) return;
            const isCorrect = slot.occupiedBy === slot.targetKey;
            img.setTint(isCorrect ? 0x00ff00 : 0xff4444);
        });
    }

    enableGameInteraction(enable) {
        this.answerKeyObjects.forEach(
            img => img.setInteractive(enable)
        );
        this.fillSlots.forEach(slot => slot.selectArea.setVisible(false));
        this.confirmBtn.setVisible(enable);
    }

    checkAnswer() {
        console.log('Checking answers...');
        // Each slot's occupiedBy must match its targetKey
        const allCorrect = this.fillSlots.every(slot => slot.occupiedBy === slot.targetKey);


        if (allCorrect) {
            console.log('All correct!');
            this.onRoundWin();
        } else {
            console.log('Incorrect, try again.');
            this.handleLose();
        }
    }

    resetForNewRound() {
        // Clear all slots
        this.fillSlots.forEach(slot => { slot.occupiedBy = null; });

        // Re-shuffle spawn positions and reassign to each key
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnPositions]);

        this.answerKeyObjects.forEach((img, i) => {
            img.currentSlot = null;
            img.setTexture(img.answerKey);
            img.clearTint();
            img.setDepth(10);

            const pos = shuffledPositions[i];
            img.originalX = pos.x;
            img.originalY = pos.y;
            img.x = pos.x;
            img.y = pos.y;
        });
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
        this.showBubble('noBubble', this.playerGender);
        //this.playFeedback(true, () =>);
    }


    showWin() {
        // Hide all game objects
        this.content?.setVisible(false);
        this.answerKeyObjects?.forEach(img => img.setVisible(false));
        this.fillSlots?.forEach(slot => slot.selectArea.setVisible(false));
        this.confirmBtn?.setVisible(false);

        this.video = this.add.video(this.centerX, this.centerY, `game7_final_${this.genderKey}bg1`).setDepth(100);
        this.video.play(true);

        this.dialog1 = this.add.image(this.centerX, this.centerY + 300, 'game7_npc_box_win1')
            .setDepth(101).setInteractive({ useHandCursor: true });


        this.dialog1.on('pointerdown', () => {
            this.dialog1.destroy();

            this.dialog2 = this.add.image(this.centerX, this.centerY + 300, 'game7_npc_box_win2')
                .setDepth(101).setInteractive({ useHandCursor: true });

            this.dialog2.on('pointerdown', () => {
                this.dialog2.destroy();
                this.feedback = this.add.image(this.centerX, this.centerY + 300, `game7_${this.genderKey}_feedback`)
                    .setDepth(101).setInteractive({ useHandCursor: true });

                this.feedback.on('pointerdown', () => {
                    this.feedback.destroy();
                    this.playVideoFeedback();
                });

            });
        });

    }

    playVideoFeedback() {
        this.video = this.add.video(this.centerX, this.centerY, `game7_final_${this.genderKey}bg2`).setDepth(100);
        this.video.play(true);

        this.time.delayedCall(500, () => {
            this.feedback2 = this.add.image(this.centerX, this.centerY + 300, 'game7_npc_box_feedback')
                .setDepth(101).setInteractive({ useHandCursor: true });

            this.feedback2.on('pointerdown', () => {
                this.feedback2.destroy();
                this.showObjectPanel();
            });
        });
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'final_preview',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.switchToGameScene(this, 'GameResultScene'));
    }


}