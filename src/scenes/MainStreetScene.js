import { CustomButton } from '../UI/Button.js';
import UIHelper from '../UI/UIHelper.js';
import { CustomPanel, SettingPanel } from '../UI/Panel.js';
import NpcHelper from '../Character/NpcHelper.js';
import GameManager from './GameManager.js';

export class MainStreetScene extends Phaser.Scene {
    constructor() {
        super('MainStreetScene');
    }

    preload() {

        // Create loading bar UI
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Loading bar background
        // const barBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x222222);
        // barBg.setStrokeStyle(2, 0xffffff);

        // // Loading bar fill
        // const barFill = this.add.rectangle(width / 2 - 195, height / 2, 0, 22, 0x00ff00);
        // barFill.setOrigin(0, 0.5);

        // // Loading text
        // const loadingText = this.add.text(width / 2, height / 2 - 50, '載入中...', {
        //     fontSize: '24px',
        //     fontFamily: 'Arial',
        //     color: '#ffffff'
        // }).setOrigin(0.5);

        // // Percentage text
        // const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
        //     fontSize: '20px',
        //     fontFamily: 'Arial',
        //     color: '#ffffff'
        // }).setOrigin(0.5);

        // // Update progress bar on load progress
        // this.load.on('progress', (value) => {
        //     barFill.width = 390 * value;
        //     percentText.setText(Math.round(value * 100) + '%');
        // });

        // // Minimum wait time in ms (30 seconds)
        // const minWaitTime = 30000;
        // const startTime = Date.now();
        // let isAssetsLoaded = false;

        // const checkLoadingComplete = () => {
        //     const elapsedTime = Date.now() - startTime;
        //     if (isAssetsLoaded && elapsedTime >= minWaitTime) {
        //         barBg.destroy();
        //         barFill.destroy();
        //         loadingText.destroy();
        //         percentText.destroy();
        //     } else if (isAssetsLoaded) {
        //         // If assets loaded but time hasn't passed, check again later
        //         const remainingTime = minWaitTime - elapsedTime;
        //         this.time.delayedCall(remainingTime, checkLoadingComplete, [], this);
        //     }
        // };

        // // Clean up when loading complete
        // this.load.on('complete', () => {
        //     isAssetsLoaded = true;
        //     checkLoadingComplete();
        // });
        //main street backgrounds
        this.load.image('stage1', 'assets/images/MainStreet/stage1.png');
        this.load.image('stage2', 'assets/images/MainStreet/stage2.png');
        this.load.image('stage3', 'assets/images/MainStreet/stage3.png');

        this.load.image('gameintro_01', 'assets/images/MainStreet/gameintro.png');
        this.load.image('gametimer', 'assets/images/MainStreet/gameintro_timer.png');

        for (let i = 1; i <= 7; i++) {
            this.load.image(`stage_object_game${i}`, `assets/images/MainStreet/NPCs/stage_object_game${i}.png`);
            this.load.image(`stage_object_game${i}_select`, `assets/images/MainStreet/NPCs/stage_object_game${i}_select.png`);
        }


        // // Only load spritesheets for the selected gender
        let gender = 'M';
        try {
            if (localStorage.getItem('player')) {
                gender = JSON.parse(localStorage.getItem('player')).gender || 'M';
            }
        } catch (e) {
            gender = 'M';
        }

        if (gender === 'M') {
            this.load.spritesheet('boy_idle', 'assets/images/MainStreet/Boy/maincharacter_boy_middlestand.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_left_talk', 'assets/images/MainStreet/Boy/maincharacter_boy_lefttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_right_talk', 'assets/images/MainStreet/Boy/maincharacter_boy_righttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_left_walk', 'assets/images/MainStreet/Boy/maincharacter_boy_leftwalk.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('boy_right_walk', 'assets/images/MainStreet/Boy/maincharacter_boy_rightwalk.png',
                { frameWidth: 300, frameHeight: 350 });
        }

        if (gender === 'F') {
            this.load.spritesheet('girl_idle', 'assets/images/MainStreet/Girl/maincharacter_girl_middlestand.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_left_talk', 'assets/images/MainStreet/Girl/maincharacter_girl_lefttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_right_talk', 'assets/images/MainStreet/Girl/maincharacter_girl_righttalking.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_left_walk', 'assets/images/MainStreet/Girl/maincharacter_girl_leftwalk.png',
                { frameWidth: 300, frameHeight: 350 });
            this.load.spritesheet('girl_right_walk', 'assets/images/MainStreet/Girl/maincharacter_girl_rightwalk.png',
                { frameWidth: 300, frameHeight: 350 });
        }

        // // NPC spritesheets
        this.load.spritesheet('npc1', 'assets/images/MainStreet/NPCs/npc1.png',
            { frameWidth: 149, frameHeight: 178.5 });

    }

    create() {
        // Create NPC animations
        this.createAnimations();

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.centerX = width / 2;
        this.centerY = height / 2;

        const gender = localStorage.getItem('player') ? JSON.parse(localStorage.getItem('player')).gender : 'M';

        this.genderKey = gender === 'M' ? 'boy' : 'girl';
        const genderKey = this.genderKey;

        const playerPos = localStorage.getItem('playerPosition')
            ? JSON.parse(localStorage.getItem('playerPosition')) : { x: 600, y: 280 };
        this.playerPos = playerPos;


        console.log(`Player gender: ${gender}, genderKey: ${genderKey}`);

        const bgKeys = ['stage1', 'stage2'];
        const templeKeys = ['stage3'];
        let currentX = 0;
        //background
        bgKeys.forEach((key, index) => {
            const bg = this.add.image(currentX, 540, key).setOrigin(0, 0.5).setDepth(1);
            currentX += bg.width; // 累加寬度，讓下一張接在後面
        });
        const temple = this.add.image(480, 180, 'stage3').setOrigin(0, 0.5).setDepth(10).setScale(0.9);


        // 設定相機邊界為總長度 8414px
        this.cameras.main.setBounds(0, 0, 2580, 1080);

        const introPage = [
            {
                content: 'gameintro_01',
                nextBtn: null, nextBtnClick: null,
                prevBtn: null, prevBtnClick: null,
                closeBtn: 'gameintro_closebutton', closeBtnClick: 'gameintro_closebutton_click'
            },
        ]

        const ui = UIHelper.createGameCommonUI(this, null, introPage, 0);
        //ui.descriptionPanel.setVisible(true);

        // Check if intro has been seen in this session
        // const hasSeenIntro = sessionStorage.getItem('hasSeenMainStreetIntro');
        // if (hasSeenIntro) {
        //     if (ui && ui.descriptionPanel) {
        //         ui.descriptionPanel.setVisible(false);
        //     }
        // } else {
        //     sessionStorage.setItem('hasSeenMainStreetIntro', 'true');
        // }

        //buttons
        this.isLeftDown = false;
        this.isRightDown = false;
        this.isTalking = false;

        this.btnLeft = new CustomButton(this, 150, height / 2, 'prev_button', 'prev_button_click',
            () => {
                this.isLeftDown = true;
                this.handleAnimation(genderKey, true, true);
            },
            () => {
                this.isLeftDown = false;
                this.handleAnimation(genderKey, false, true);
            }
        ).setScrollFactor(0).setDepth(100);

        this.btnRight = new CustomButton(this, width - 150, height / 2, 'next_button', 'next_button_click',
            () => {
                this.isRightDown = true;
                this.handleAnimation(genderKey, true, false);
            },
            () => {
                this.isRightDown = false;
                this.handleAnimation(genderKey, false, true);
            }
        ).setScrollFactor(0).setDepth(100);


        this.bubbleTimers = [];
        const game1_bubble = ''


        // NPCs (trigger game)
        this.interactiveNpcs = [];

        const n1 = NpcHelper.createNpc(this, 1, 1900, 200, 1, 'npc1', 7, 'npc1_anim');

        const n1_item = NpcHelper.createNpcItem(this, 1, 1400, 250, 1, 'stage_object_game1', 'stage_object_game1_select', 7);

        const n2_item = NpcHelper.createNpcItem(this, 1, 2200, 350, 1, 'stage_object_game2', 'stage_object_game2_select', 7);
        const n3_item = NpcHelper.createNpcItem(this, 1, width / 2 + 380, 1050, 1, 'stage_object_game3', 'stage_object_game3_select', 8);
        const n4_item = NpcHelper.createNpcItem(this, 1, width / 2 + 100, 380, 1, 'stage_object_game4', 'stage_object_game4_select', 8);
        const n5_item = NpcHelper.createNpcItem(this, 1, 180, 280, 1, 'stage_object_game5', 'stage_object_game5_select', 7);
        const n6_item = NpcHelper.createNpcItem(this, 1, width / 2 + 380, 1050, 1, 'stage_object_game6', 'stage_object_game6_select', 7);
        const n7_item = NpcHelper.createNpcItem(this, 1, width / 2 + 950, 650, 1, 'stage_object_game7', 'stage_object_game7_select', 10);

        n1_item.setScale(0.8);
        n4_item.setScale(0.9);
        n5_item.setScale(0.9);
        n7_item.setScale(0.9);

        this.interactiveNpcs.push(n1);

        this.currentInteractiveNpc = null;

        // Add global input listener to stop movement when pointer is released anywhere
        this.input.on('pointerup', () => {
            this.isLeftDown = false;
            this.isRightDown = false;
        });

        const npcGameMap = { 1: 4, 2: 2, 3: 3, 4: 1, 5: 5, 6: 6, 7: 7 };
        this.interactiveNpcs.forEach((npc, index) => {
            npc.on('pointerdown', () => {
                if (npc.canInteract) {
                    const gameNumber = npcGameMap[npc.id] ?? (index + 1);
                    const sceneKey = `GameScene_${gameNumber}`;
                    const characterbubble = `game${gameNumber}_${genderKey}_bubble`;
                    this.loadBubble(0, npc.bubbles, sceneKey, npc, characterbubble);
                }
            });
        });


        this.playerSprite = this.add.sprite(playerPos.x, playerPos.y,
            `${genderKey}_idle`).setDepth(7).setScale(1.5);

        this.playerSprite.anims.play(`${genderKey}_idle_anim`);

        // 將相機鎖定在玩家身上
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    }

    update() {
        const speed = 5;
        let isMoving = false;
        let isLeft = this.playerSprite.lastDirectionLeft; // 保持最後的方向狀態

        // 純按鈕判定
        if (this.isLeftDown) {
            this.playerSprite.x -= speed;
            isLeft = true;
            isMoving = true;
        } else if (this.isRightDown) {
            this.playerSprite.x += speed;
            isLeft = false;
            isMoving = true;
        } else {
            this.playerSprite.x += 0;
            isMoving = false;
        }
        this.playerSprite.lastDirectionLeft = isLeft;

        this.playerSprite.x = Phaser.Math.Clamp(this.playerSprite.x, 200, 2300);


        const allNpcs = [...this.interactiveNpcs];
        this.currentNpcActivated = null;

        allNpcs.forEach(npc => {
            const dist = Math.abs(this.playerSprite.x - npc.x);

            if (dist < npc.proximityDistance) {
                npc.canInteract = true;
                //  npc.setTint(0x888888);
            } else {
                npc.canInteract = false;
                //  npc.setTint(0xffffff);
                // IF THIS NPC was the one owning the active bubbles
                if ((this.currentActiveBubble && this.currentActiveBubble.ownerNpc === npc) ||
                    (this.characterActiveBubble && this.characterActiveBubble.ownerNpc === npc)) {

                    // 1. Clear all pending timers to prevent bubbles "popping up" later
                    this.bubbleTimers.forEach(t => t.remove());
                    this.bubbleTimers = [];

                    // 2. Destroy NPC Bubble
                    if (this.currentActiveBubble) {
                        this.currentActiveBubble.destroy();
                        this.currentActiveBubble = null;
                    }

                    // 3. Destroy Character Bubble
                    if (this.characterActiveBubble) {
                        this.characterActiveBubble.destroy();
                        this.characterActiveBubble = null;
                    }
                }
            }
        });
    }

    handleAnimation(gender, isMoving, isLeft) {
        let walkKey = `${gender}_left_walk_anim`;
        let idleKey = `${gender}_idle_anim`;

        if (isMoving) {
            // true means: if 'walkKey' is already playing, don't restart it
            this.playerSprite.play(walkKey, true);
            if (!isLeft) {
                this.playerSprite.setFlipX(true);
            } else {
                this.playerSprite.setFlipX(false);
            }
        } else {
            this.playerSprite.play(idleKey, true);
        }
    }

    switchTalkingAnimation(gender, isLeft) {
        if (isLeft === undefined) isLeft = this.playerSprite.lastDirectionLeft;
        let talkKey = isLeft ? `${gender}_left_talk_anim` : `${gender}_right_talk_anim`;
        this.playerSprite.play(talkKey, true);
        this.playerSprite.setFlipX(false); // talking animations seem to have dedicated left/right sprites
    }


    loadBubble(index = 0, bubbles, sceneKey, targetNpc, characterbubble) {
        // Negative = player is left of NPC (facing right); Positive = player is right of NPC (facing left)
        const facingLeft = (this.playerSprite.x - targetNpc.x) > 0;

        if (this.currentActiveBubble) {
            this.currentActiveBubble.destroy();
        }
        if (this.characterActiveBubble) {
            this.characterActiveBubble.destroy();
        }

        // Special handling for NPC 5 and 6: Check if Games 1-4 are completed
        // if (targetNpc.id === 5 || targetNpc.id === 6) {
        //     const allResults = GameManager.loadGameResult();
        //     // Check if games 1, 2, 3, and 4 are finished
        //     const canStartGame = [1, 2, 3, 4].every(num => {
        //         const res = allResults.find(r => r.game === num);
        //         return res && res.isFinished;
        //     });

        //     if (!canStartGame) {
        //         console.log("Game is locked. Prerequisites (Games 1-4) not met.");
        //         // Use string arrays directly as the variables are not in scope here
        //         bubbles = targetNpc.id === 5 ? ['npc5_bubble_reject'] : ['npc6_bubble_reject'];
        //         sceneKey = null; // Prevent starting the game
        //     }
        // }

        this.bubbleImg = this.add.image(this.centerX, 900, bubbles[index])
            .setDepth(200)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0);

        // 綁定當前 NPC 到對話框，方便 update 檢查距離
        this.bubbleImg.ownerNpc = targetNpc;
        this.currentActiveBubble = this.bubbleImg;

        this.characterBubbleImg = this.add.image(this.centerX, 900, characterbubble)
            .setDepth(200)
            .setInteractive({ useHandCursor: true })
            .setVisible(false)
            .setScrollFactor(0);

        this.characterActiveBubble = this.characterBubbleImg;
        this.characterActiveBubble.ownerNpc = targetNpc;


        this.bubbleImg.on('pointerdown', () => {
            this.bubbleImg.destroy();
            this.currentActiveBubble = null;

            // Store this timer so we can stop it
            const timer1 = this.time.delayedCall(500, () => {
                // IMPORTANT: Check if the player is still "allowed" to see this
                if (!targetNpc.canInteract) return;

                this.characterBubbleImg.setVisible(true);
                this.switchTalkingAnimation(this.genderKey, facingLeft);

                this.characterBubbleImg.on('pointerdown', () => {
                    this.characterBubbleImg.destroy();
                    this.characterActiveBubble = null;

                    const timer2 = this.time.delayedCall(1000, () => {
                        if (sceneKey) {
                            localStorage.setItem('playerPosition', JSON.stringify({ x: this.playerSprite.x, y: this.playerSprite.y }));
                            GameManager.switchToGameScene(this, sceneKey);
                        }
                    });
                    this.bubbleTimers.push(timer2);
                });
            });
            this.bubbleTimers.push(timer1);
        });

        // 彈出動畫
        this.tweens.add({
            targets: this.bubbleImg,
            scale: { from: 0.5, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: this.characterBubbleImg,
            scale: { from: 0.5, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    createAnimations() {

        // NPC Animations
        this.anims.create({
            key: 'npc1_anim',
            frames: this.anims.generateFrameNumbers('npc1', { start: 0, end: 70 }),
            frameRate: 30,
            repeat: -1
        });

        this.anims.create({
            key: 'npc1_glow_anim',
            frames: this.anims.generateFrameNumbers('npc1_glow', { start: 0, end: 70 }),
            frameRate: 30,
            repeat: -1
        });


        // Player character animations

        this.anims.create({
            key: 'boy_idle_anim',
            frames: this.anims.generateFrameNumbers('boy_idle', { start: 0, end: 152 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_left_talk_anim',
            frames: this.anims.generateFrameNumbers('boy_left_talk', { start: 0, end: 168 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_right_talk_anim',
            frames: this.anims.generateFrameNumbers('boy_right_talk', { start: 0, end: 168 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_left_walk_anim',
            frames: this.anims.generateFrameNumbers('boy_left_walk', { start: 0, end: 48 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_right_walk_anim',
            frames: this.anims.generateFrameNumbers('boy_right_walk', { start: 0, end: 48 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_idle_anim',
            frames: this.anims.generateFrameNumbers('girl_idle', { start: 0, end: 152 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_left_talk_anim',
            frames: this.anims.generateFrameNumbers('girl_left_talk', { start: 0, end: 23 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_right_talk_anim',
            frames: this.anims.generateFrameNumbers('girl_right_talk', { start: 0, end: 49 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_left_walk_anim',
            frames: this.anims.generateFrameNumbers('girl_left_walk', { start: 0, end: 48 }),
            frameRate: 24,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_right_walk_anim',
            frames: this.anims.generateFrameNumbers('girl_right_walk', { start: 0, end: 48 }),
            frameRate: 10,
            repeat: -1
        });
    }

}