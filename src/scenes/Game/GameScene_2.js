import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_2 extends BaseGameScene {
    constructor() {
        super('GameScene_2');
    }
    preload() {
        const path = 'assets/images/Game_2/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.load.image('game2_npc_box_mainstreet', `${path}game2_npc_box1.png`);
        this.load.image('game2_npc_box_intro', `${path}game2_npc_box2.png`);
        this.load.image('game2_npc_box_win', `${path}game2_npc_box3.png`);
        this.load.image('game2_npc_box_tryagain', `${path}game2_npc_box4.png`);


        this.gender = 'M';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }
        if (this.gender === 'M') {
            this.load.spritesheet('boy_fail', path +
                'game2_boy_fail.png', { frameWidth: 340, frameHeight: 500 });

            this.load.spritesheet('boy_left', path +
                'game2_boy_left.png', { frameWidth: 340, frameHeight: 500 });

            this.load.spritesheet('boy_middle', path +
                'game2_boy_middle.png', { frameWidth: 340, frameHeight: 500 });

            this.load.spritesheet('boy_right', path +
                'game2_boy_right.png', { frameWidth: 340, frameHeight: 500 });

            this.load.spritesheet('boy_success', path +
                'game2_boy_success.png', { frameWidth: 340, frameHeight: 500 });
        } else {
            this.load.spritesheet('girl_fail', path +
                'game2_girl_fail.png', { frameWidth: 170, frameHeight: 250 });

            this.load.spritesheet('girl_left', path +
                'game2_girl_left.png', { frameWidth: 170, frameHeight: 250 });
            this.load.spritesheet('girl_middle', path +
                'game2_girl_middle.png', { frameWidth: 170, frameHeight: 250 });

            this.load.spritesheet('girl_right', path +
                'game2_girl_right.png', { frameWidth: 170, frameHeight: 250 });

            this.load.spritesheet('girl_success', path +
                'game2_girl_success.png', { frameWidth: 170, frameHeight: 250 });
        }

    }

    create() {
        this.createAnimations();

        // Movement settings
        this.moveStep = 60;  // Pixels per move
        this.isMoving = false;

        // Player start position
        this.playerStartX = this.centerX + 50;
        this.playerStartY = 800;

        this.initGame('game2_bg', 'game2_description', false, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: false,
            sceneIndex: 2
        });

        this.leftBtn = new CustomButton(this, 1550, 900, 'left_btn', 'left_btn_click', () => {
            this.moveDirection('left');
            this.resetPlayerState();
        }, () => {
        }).setDepth(2);

        this.rightBtn = new CustomButton(this, 1750, 900, 'right_btn', 'right_btn_click',
            () => {
                this.moveDirection('right');
                this.resetPlayerState();
            }, () => {

            }).setDepth(2);

        // Initially disable buttons until game starts
        this.leftBtn.setVisible(false);
        this.rightBtn.setVisible(false);
        this.leftBtn.disableInteractive();
        this.rightBtn.disableInteractive();

        this.genderKey = this.gender === 'M' ? 'boy' : 'girl';
        console.log('genderKey:', this.genderKey);

        this.player = this.add.sprite(this.centerX, 1000, `${this.genderKey}_middle`)
            .setOrigin(0.5, 1).setDepth(2);

        if (this.genderKey === 'girl') {
            this.player.setScale(2); // Adjust scale for
        }
        this.player.anims.play(`${this.genderKey}_middle_anim`, true);

        this.playerBasket = this.add.zone(this.player.x, this.player.y - 150, 180, 80);

        this.physics.add.existing(this.playerBasket);
        this.playerBasket.body.setAllowGravity(false);
        this.playerBasket.body.setImmovable(true);

        this.basketGfx = this.add.graphics();
        this.basketGfx.setDepth(3);


        // spawn settings
        this.canSpawn = false;
        this.minX = 200;
        this.maxX = 1600;
        this.minY = 0;
        this.maxY = 700;
        this.failSpeed = 4;
        this.isSlowDown = false;
        this.slowDownSpeed = this.failSpeed / 2;

        this.successCount = 0;


        this.failItemKeys = [
            'game2_failobject1',
            'game2_failobject2',
            'game2_failobject3'
        ];

        this.fallingItemsGroup = this.physics.add.group();
        this.fallingItems = [];

        this.spawnTimer = 0;

        this.physics.add.overlap(this.playerBasket, this.fallingItemsGroup, (basket, item) => {
            this.handleItemCollection(item);
        }, null, this);
    }
    moveDirection(direction) {
        const speed = 100;
        this.player.anims.play(`${this.genderKey}_${direction}_anim`, true);
        this.player.x += direction === 'left' ? -speed : speed;
    }

    resetPlayerState() {
        this.time.delayedCall(300, () => {
            this.player.anims.play(`${this.genderKey}_middle_anim`, true);
        });
    }
    enableGameInteraction(enabled) {
        this.canSpawn = enabled;
        this.leftBtn.setVisible(enabled);
        this.rightBtn.setVisible(enabled);

        if (enabled) {
            this.leftBtn.setInteractive();
            this.rightBtn.setInteractive();
        } else {
            this.leftBtn.disableInteractive();
            this.rightBtn.disableInteractive();
        }
        this.fallingItems.forEach(item => {
            item.setActive(enabled).setVisible(enabled);
        });
    }

    resetForNewRound() {
        // Clear all falling items from both group and array
        if (this.fallingItemsGroup) {
            this.fallingItemsGroup.clear(true, true); // Remove and destroy all children
        }

        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
            if (item) {
                item.destroy();
            }
        }
        this.fallingItems = [];

        // Reset spawn timer
        this.lastSpawnTime = null;
        this.lastSuccessSpawnTime = null;
        this.canSpawn = false;

        // Reset player position to center
        if (this.player) {
            this.player.x = this.centerX;
            this.player.y = 1000;
            this.player.anims.play(`${this.genderKey}_middle_anim`, true);
        }

        // Reset player basket to match player position and update physics body
        if (this.playerBasket && this.playerBasket.body) {
            const newX = this.centerX;
            const newY = 1000 - 450; // Same calculation as in update

            this.playerBasket.x = newX;
            this.playerBasket.y = newY;

            // Important: Update the physics body position explicitly
            this.playerBasket.body.reset(newX, newY);
        }

        // Reset fail speed
        this.failSpeed = 4;
        this.isSlowDown = false;

        // Reset success counter
        this.successCount = 0;

        console.log('[GameScene_2] Reset for new round');
    }


    update() {

        if (!this.canSpawn) return;

        if (this.player && this.playerBasket) {
            // Sync the invisible physics body - update both position and physics body
            this.playerBasket.x = this.player.x;
            this.playerBasket.y = this.player.y - 450;

            // Update the physics body position to match
            if (this.playerBasket.body) {
                this.playerBasket.body.x = this.playerBasket.x - this.playerBasket.width / 2;
                this.playerBasket.body.y = this.playerBasket.y - this.playerBasket.height / 2;
            }

            // // Redraw the visual box
            // this.basketGfx.clear();
            // this.basketGfx.lineStyle(2, 0x00ff00, 1); // Green border
            // this.basketGfx.strokeRect(
            //     this.playerBasket.x - 75, // Center it (150 width / 2)
            //     this.playerBasket.y - 25, // Center it (50 height / 2)
            //     this.playerBasket.width,
            //     this.playerBasket.height
            // );
            // Spawn new fail item every 800ms
            if (!this.lastSpawnTime) this.lastSpawnTime = this.time.now;
            if (this.time.now - this.lastSpawnTime > 800) {
                this.spawnRandomFailItem();
                this.lastSpawnTime = this.time.now;
            }

            // Spawn success item on a separate timer (e.g., every 3-5 seconds)
            if (!this.lastSuccessSpawnTime) this.lastSuccessSpawnTime = this.time.now;
            if (this.time.now - this.lastSuccessSpawnTime > Phaser.Math.Between(1000, 2000)) {
                this.spawnSuccessItem();
                this.lastSuccessSpawnTime = this.time.now;
            }

            // Make all falling items fall
            for (let i = this.fallingItems.length - 1; i >= 0; i--) {
                const item = this.fallingItems[i];
                if (item.active) {
                    item.y += this.failSpeed; // fall speed
                    if (item.y > this.maxY) {
                        item.setActive(false).setVisible(false);
                        this.fallingItems.splice(i, 1);
                    }
                }
            }
        }
    }

    handleLose() {
        if (this.gameState === 'gameLose' || this.gameState === 'gameWin') return;

        if (!this.isSlowDown) {
            this.failSpeed = this.slowDownSpeed;
            this.isSlowDown = true;
            console.log("Fail speed reduced for next rounds.");
        } else {
            this.currentFailCount = (this.currentFailCount || 0) + 1;
            this.isGameActive = false;
            this.gameState = 'gameLose';
            this.fallingItems.forEach(item => item.destroy());
            this.label = this.add.image(1650, 350, 'game_fail_label').setDepth(555);
            if (this.gameTimer) this.gameTimer.stop();
            this.enableGameInteraction(false);
            this.updateRoundUI(false);

            this.showBubble('tryagain');
        }
    }

    showWin() {
        this.showObjectPanel();
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game2_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }

    spawnRandomFailItem() {
        // Pick a random fail item key
        const key = Phaser.Utils.Array.GetRandom(this.failItemKeys);
        // Spawn at random x, always y = minY
        const x = Phaser.Math.Between(this.minX, this.maxX);

        const y = this.minY;
        // Create the sprite
        const item = this.physics.add.sprite(x, y, key).setOrigin(0.5, 0.5).setDepth(2);
        item.isSuccessObject = false;

        item.setActive(true).setVisible(true);
        this.fallingItemsGroup.add(item);
        this.fallingItems.push(item);
    }

    spawnSuccessItem() {
        const key = 'game2_successobject';
        // Spawn at random x, always y = minY
        const x = Phaser.Math.Between(this.minX, this.maxX);

        const y = this.minY;
        // Create the sprite
        const item = this.physics.add.sprite(x, y, key).setOrigin(0.5, 0.5).setDepth(2);
        item.isSuccessObject = true;

        item.setActive(true).setVisible(true);
        this.fallingItemsGroup.add(item);
        this.fallingItems.push(item);
    }


    handleItemCollection(item) {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        if (item.isSuccessObject) {
            item.destroy();

            // Increment success counter
            this.successCount++;
            console.log(`Success item collected! Count: ${this.successCount}/${this.targetRounds}`);

            // Update round UI to show progress (uses current roundIndex)
            this.updateRoundUI(true);

            // Only trigger win when all required successes are collected
            if (this.successCount >= this.targetRounds) {
                this.onRoundWin();
            } else {
                // Increment roundIndex for next collection's UI update
                this.roundIndex++;
            }
        } else {
            item.destroy();
            this.fallingItemsGroup.remove(item);
            this.handleLose();
        }
    }
    createAnimations() {
        // Boy animations
        this.anims.create({
            key: 'boy_fail_anim',
            frames: this.anims.generateFrameNumbers('boy_fail', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_left_anim',
            frames: this.anims.generateFrameNumbers('boy_left', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_middle_anim',
            frames: this.anims.generateFrameNumbers('boy_middle', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_right_anim',
            frames: this.anims.generateFrameNumbers('boy_right', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_success_anim',
            frames: this.anims.generateFrameNumbers('boy_success', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });

        // Girl animations
        this.anims.create({
            key: 'girl_fail_anim',
            frames: this.anims.generateFrameNumbers('girl_fail', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_left_anim',
            frames: this.anims.generateFrameNumbers('girl_left', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_middle_anim',
            frames: this.anims.generateFrameNumbers('girl_middle', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_right_anim',
            frames: this.anims.generateFrameNumbers('girl_right', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'girl_success_anim',
            frames: this.anims.generateFrameNumbers('girl_success', { start: 0, end: 66 }),
            frameRate: 30,
            repeat: -1
        });
    }
}