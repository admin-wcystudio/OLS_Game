import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_6 extends BaseGameScene {
    constructor() {
        super('GameScene_6');
    }

    preload() {
        const path = 'assets/images/Game_6/';
        const player = JSON.parse(localStorage.getItem('player') || '{"gender":"M"}');
        this.genderKey = player.gender === 'M' ? 'boy' : 'girl';

        this.load.image('confirm_button', `${path}game6_confirm_button.png`);
        this.load.image('confirm_button_select', `${path}game6_confirm_button_select.png`);

        if (this.genderKey === 'boy') {
            this.load.image('game6_npc_box_intro', `${path}game6_npc_boy_box3.png`);
        } else {
            this.load.image('game6_npc_box_intro', `${path}game6_npc_girl_box3.png`);
        }

        this.load.image('game6_npc_box_win', `${path}game6_npc_box4.png`);
        this.load.image('game6_npc_box_tryagain', `${path}game6_npc_box7.png`);

        this.load.image('game6_boy_npc_box1', `${path}game6_npc_boy_box3.png`);
        this.load.image('game5_boy_npc_box2', `${path}game6_npc_boy_box5.png`);

        this.load.image('game6_girl_npc_box1', `${path}game6_npc_girl_box3.png`);
        this.load.image('game6_girl_npc_box2', `${path}game6_npc_girl_box5.png`);


        for (let i = 1; i <= 8; i++) {
            this.load.image(`game6_object${i}`, `${path}game6_object${i}.png`);
        }

        this.load.image('game6_border1', `${path}game6_border1.png`);
        this.load.image('game6_border2', `${path}game6_border2.png`);

    }

    create() {
        // Initialize dimensions
        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.initGame('game6_bg', 'game6_description', false, false, {
            targetRounds: 1,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: false,
            sceneIndex: 6
        });

        // Create confirm button
        this.confirmBtn = new CustomButton(this, this.centerX, this.height - 100,
            'confirm_button', 'confirm_button_select', () => {
                this.checkAnswer();
            });
        this.confirmBtn.setDepth(600).setVisible(false);
    }

    setupGameObjects() {

        this.border1 = this.add.image(this.centerX - 400, this.centerY, 'game6_border1').setDepth(500).setVisible(true);
        this.border2 = this.add.image(this.centerX + 400, this.centerY, 'game6_border2').setDepth(500).setVisible(true);

        // Track which object is at each position
        this.positionObjects = {};

        // Border 1 (left) - 4 positions in a 2x2 grid
        this.snapPositions = [
            // Border 1 positions
            { x: this.centerX - 485, y: this.centerY - 90, isOccupied: false },
            { x: this.centerX - 320, y: this.centerY - 90, isOccupied: false },
            { x: this.centerX - 485, y: this.centerY + 90, isOccupied: false },
            { x: this.centerX - 320, y: this.centerY + 90, isOccupied: false },
            // Border 2 positions (right)
            { x: this.centerX + 320, y: this.centerY - 90, isOccupied: false },
            { x: this.centerX + 485, y: this.centerY - 90, isOccupied: false },
            { x: this.centerX + 320, y: this.centerY + 90, isOccupied: false },
            { x: this.centerX + 485, y: this.centerY + 90, isOccupied: false }
        ];

        this.snapRadius = 90; // Distance threshold for snapping

        const spawnPositions = [
            { x: this.centerX - 780, y: this.centerY - 100 },
            { x: this.centerX - 800, y: this.centerY + 100 },
            { x: this.centerX, y: this.centerY + 200 },
            { x: this.centerX, y: this.centerY - 200 },
            { x: this.centerX + 100, y: this.centerY },
            { x: this.centerX - 100, y: this.centerY },
            { x: this.centerX + 800, y: this.centerY - 100 },
            { x: this.centerX + 780, y: this.centerY + 100 }
        ];



        const shuffledPositions = Phaser.Utils.Array.Shuffle([...spawnPositions]);

        this.objects = [];
        for (let i = 1; i <= 8; i++) {
            const pos = shuffledPositions[i - 1];
            const obj = this.add.image(pos.x, pos.y, `game6_object${i}`)
                .setDepth(505)
                .setInteractive({ draggable: true })
                .setVisible(false);

            obj.objectId = i;
            obj.originalX = pos.x;
            obj.originalY = pos.y;

            this.objects.push(obj);
        }

        // Set up drag events
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {

            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        // Add dragend event for snapping
        this.input.on('dragend', (pointer, gameObject) => {
            const result = this.findNearestSnapPosition(gameObject.x, gameObject.y, gameObject);
            if (result.snapPos) {
                // Snap to position with animation
                this.tweens.add({
                    targets: gameObject,
                    x: result.snapPos.x,
                    y: result.snapPos.y,
                    duration: 150,
                    ease: 'Power2',
                    onComplete: () => {
                        // Check if all border 1 positions are occupied
                        this.checkIfAllOccupied();
                    }
                });
            } else {
                console.log(`[SNAP] No snap position found within ${this.snapRadius}px radius`);
            }
        });

        this.border1_correctObjects = [2, 5, 6, 8];
        this.border2_correctObjects = [1, 3, 4, 7];
        //this.drawDebug();

    }

    findNearestSnapPosition(x, y, gameObject = null) {
        let nearestPos = null;
        let nearestIndex = -1;
        let minDistance = this.snapRadius;

        for (let i = 0; i < this.snapPositions.length; i++) {
            const pos = this.snapPositions[i];
            const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPos = pos;
                nearestIndex = i;
            }
        }

        if (nearestPos && gameObject) {
            // Remove this object from any previous position
            Object.keys(this.positionObjects).forEach(key => {
                if (this.positionObjects[key] === gameObject.objectId) {
                    delete this.positionObjects[key];
                    this.snapPositions[key].isOccupied = false;
                }
            });

            // Track this object at the new position
            this.positionObjects[nearestIndex] = gameObject.objectId;
            nearestPos.isOccupied = true;

            // Debug log for snap positions
            if (nearestIndex >= 0 && nearestIndex <= 3) {
                console.log(`[SNAP] Object ${gameObject.objectId} snapped to snapPosition[${nearestIndex}] at border1`);
            } else if (nearestIndex >= 4 && nearestIndex <= 7) {
                console.log(`[SNAP] Object ${gameObject.objectId} snapped to snapPosition[${nearestIndex}] at border2`);
            }
        }

        return { snapPos: nearestPos, index: nearestIndex };
    }

    checkIfAllOccupied() {
        // Check if all positions (both borders) are occupied
        const allPositions = [0, 1, 2, 3, 4, 5, 6, 7];
        const allOccupied = allPositions.every(i => this.positionObjects.hasOwnProperty(i));

        if (allOccupied) {
            console.log('[CHECK] All positions occupied (both borders)!');
            console.log('[CHECK] Current positions:', this.positionObjects);
            console.log('[CHECK] Click confirm button to check answer');
        }
    }

    enableGameInteraction(enable) {
        this.objects.forEach((obj, index) => {
            obj.setVisible(enable);
            obj.setInteractive(enable);
            if (enable) {
                console.log(`[INTERACTION] Object ${obj.objectId} at (${Math.round(obj.x)}, ${Math.round(obj.y)}) - visible: ${obj.visible}, interactive: ${obj.input ? obj.input.enabled : 'no input'}`);
            }
        });
        if (this.confirmBtn) {
            this.confirmBtn.setVisible(enable);
            console.log(`[INTERACTION] Confirm button visibility: ${enable}`);
        }
    }

    checkAnswer() {
        console.log('[ANSWER] Checking answer...');

        // Check border 1 positions (0-3)
        const border1Positions = [0, 1, 2, 3];
        const border1Objects = border1Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined);

        // Check border 2 positions (4-7)
        const border2Positions = [4, 5, 6, 7];
        const border2Objects = border2Positions.map(i => this.positionObjects[i]).filter(id => id !== undefined)
        // Check if border 1 has all correct objects
        const border1Correct = this.border1_correctObjects.every(objId => border1Objects.includes(objId)) &&
            border1Objects.length === this.border1_correctObjects.length;

        // Check if border 2 has all correct objects
        const border2Correct = this.border2_correctObjects.every(objId => border2Objects.includes(objId)) &&
            border2Objects.length === this.border2_correctObjects.length;

        if (border1Correct && border2Correct) {
            console.log('[ANSWER] ✓ All objects correctly placed in both borders!');
            this.onRoundWin();
        } else {
            console.log('[ANSWER] ✗ Incorrect placement!');
            this.handleLose();
        }
    }

    resetForNewRound() {
        // Reset position tracking
        this.positionObjects = {};
        this.snapPositions.forEach(pos => pos.isOccupied = false);

        // Reset objects to original positions
        this.objects.forEach(obj => {
            obj.x = obj.originalX;
            obj.y = obj.originalY;
        });
    }

    showWin() {
        this.objects.forEach(obj => obj.setVisible(false));
        if (this.confirmBtn) this.confirmBtn.setVisible(false);

        this.time.delayedCall(1500, () => {
            GameManager.backToMainStreet(this);
        });
    }

    drawDebug() {

        // Debug graphics - draw snap positions
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
        this.debugGraphics.fillStyle(0xff0000, 0.2);
        this.snapPositions.forEach(pos => {
            this.debugGraphics.strokeCircle(pos.x, pos.y, 60); // Draw outer circle
            this.debugGraphics.fillCircle(pos.x, pos.y, 5); // Draw center point
        });
        this.debugGraphics.setDepth(999); // Just below borders

    }
}
