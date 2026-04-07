
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

        this.gender = 'M';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }
        if (this.gender === 'M') {
            this.load.video('game7_success', `${path}game7_success_bg_boy.mp4`);
            this.load.image('game7_npc_box_win1', `${path}game7_npc_box5_boy.png`);
            this.load.image('game7_npc_box_win2', `${path}game7_npc_box6_boy.png`);

        } else {
            this.load.video('game7_success', `${path}game7_success_bg_girl.mp4`);
            this.load.image('game7_npc_box_win1', `${path}game7_npc_box5_girl.png`);
            this.load.image('game7_npc_box_win2', `${path}game7_npc_box6_girl.png`);
        }

        this.load.image(`game7_card_bg`, `${path}game7_card_bg.png`);

        this.load.image('game7_npc_box_win', `${path}game7_npc_box4.png`);
        this.load.image('game7_npc_box_tryagain', `${path}game7_npc_box7.png`);


        this.load.image('game7_confirm_button', `${path}game7_confirm_button.png`);
        this.load.image('game7_confirm_button_select', `${path}game7_confirm_button_select.png`);

        this.load.video('game7_fail', `${path}game7_fail_bg.mp4`)

        for (let i = 1; i <= 5; i++) {
            this.load.image(`game7_object${i}`, `${path}game7_object${i}.png`);
            this.load.image(`game7_object${i}_description`, `${path}game7_object${i}_description.png`);
        }

        this.load.image('game7_final_preview', `${path}game7_final_preview.png`);

    }

    create() {

        this.initGame('game7_bg', 'game7_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 7
        });
    }
    setupGameObjects() {

        this.isChecked = false;
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 - 100;

        this.cardBg = this.add.image(centerX, centerY, 'game7_card_bg').setDepth(5);
        this.spawnCardPositions = [
            { x: centerX - 560, y: centerY + 350, },
            { x: centerX - 280, y: centerY + 350, },
            { x: centerX, y: centerY + 350, },
            { x: centerX + 280, y: centerY + 350, },
            { x: centerX + 560, y: centerY + 350, }
        ];

        this.defaultCards = [
            { id: 1, content: 'game7_object1', targetX: centerX - 560, targetY: centerY, occupiedBy: null },
            { id: 2, content: 'game7_object2', targetX: centerX - 280, targetY: centerY, occupiedBy: null },
            { id: 3, content: 'game7_object3', targetX: centerX, targetY: centerY, occupiedBy: null },
            { id: 4, content: 'game7_object4', targetX: centerX + 275, targetY: centerY, occupiedBy: null },
            { id: 5, content: 'game7_object5', targetX: centerX + 550, targetY: centerY, occupiedBy: null }
        ];


        this.cardGroup = this.add.group();

        // Shuffle spawn positions for initial spawn
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnCardPositions]);
        this.defaultCards.forEach((cardInfo, i) => {
            const spawnPos = shuffledPositions[i % shuffledPositions.length];
            const card = this.add.image(spawnPos.x, spawnPos.y, cardInfo.content);
            card.setData({ targetX: cardInfo.targetX, targetY: cardInfo.targetY, isCorrect: false });
            card.on('pointerdown', () => {
                this.selectCard(card);
            });
            this.cardGroup.add(card);
            card.setDepth(10);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (this.selectedCard !== gameObject) this.selectCard(gameObject);
            gameObject.setPosition(dragX, dragY).setDepth(100);
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setDepth(50);
            // Log the texture key (name) of the gameObject
            this.checkSnap(gameObject);
        });

        this.confirm_button = new CustomButton(this, centerX + 800, centerY + 400,
            'game7_confirm_button', 'game7_confirm_button_select',
            () => {
                console.log(' button clicked');
                if (this.isChecked) return;
                this.isChecked = true;
                this.checkAllDone();
            }, () => { });
        this.confirm_button.setActive(false);

        this.confirm_button.setDepth(100);

        // const debugGraphics = this.add.graphics().setDepth(this.depth + 2); // 擺喺背景上面，物件下面
        // debugGraphics.lineStyle(4, 0xff0000, 1); // 紅色線，粗度 2

        // const tolerance = 60; // 同你 checkSnap 裡面個數值一樣
        // this.defaultCards.forEach(data => {
        //     debugGraphics.lineStyle(3, 0x00ff00, 0.5); // 綠色虛線感
        //     debugGraphics.strokeCircle(data.targetX, data.targetY, tolerance);
        // });

    }

    selectCard(card) {
        if (this.selectedCard) {
            this.selectedCard.clearTint();
        }
        this.selectedCard = card;
        this.selectedCard.setTint(0xaaaaaa);

    }

    showObjectDescription(objectKey) {
        const descriptionKey = `${objectKey}_description`;

        const descriptionPanel = new CustomPanel(this, 960, 540, [{
            content: descriptionKey,
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        descriptionPanel.setDepth(1000);
        descriptionPanel.show();
    }

    enableGameInteraction(enable) {
        this.cardGroup.getChildren().forEach(card => {
            if (enable) {
                card.setInteractive({ draggable: true });
            } else {
                card.disableInteractive();
            }
        });
        this.confirm_button.setActive(enable);
        this.cardBg.setVisible(enable);
        if (enable) {
            this.isChecked = false;
        }
    }

    checkSnap(card) {
        // Find the nearest unoccupied card position within threshold
        const threshold = 60;
        let nearest = null;
        let minDist = Infinity;
        this.defaultCards.forEach(pos => {
            if (!pos.occupiedBy) {
                const d = Phaser.Math.Distance.Between(card.x, card.y, pos.targetX, pos.targetY);
                if (d < threshold && d < minDist) {
                    minDist = d;
                    nearest = pos;
                }
            } else {
                if (pos.occupiedBy === card) {
                    pos.occupiedBy = null;
                    card.clearTint();
                }
            }
            //console.log('Target Position -', pos.id, ',current card', pos.occupiedBy ? pos.occupiedBy.texture.key : 'none');
        });

        // Snap to nearest slot and show description
        if (nearest) {
            card.setPosition(nearest.targetX, nearest.targetY);
            nearest.occupiedBy = card;
            card.clearTint();
            this.showObjectDescription(card.texture.key);
        }
    }

    randomCardPosition(cards) {
        // Shuffle spawn positions
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnCardPositions]);
        cards.forEach((card, i) => {
            const pos = shuffledPositions[i % shuffledPositions.length];
            card.setPosition(pos.x, pos.y);
        });
    }

    checkAllDone() {
        console.log('Checking all cards...');
        let allCorrect = true;

        // Cards 6 and 7 are interchangeable (same word)

        this.defaultCards.forEach(cardInfo => {
            if (cardInfo.occupiedBy) {
                const placedKey = cardInfo.occupiedBy.texture.key;
                const targetKey = cardInfo.content;

                if (targetKey === placedKey) {
                    cardInfo.occupiedBy.setData('isCorrect', true);
                } else {
                    cardInfo.occupiedBy.setData('isCorrect', false);
                    allCorrect = false;
                }
            } else {
                allCorrect = false;
            }
        });

        if (allCorrect) {
            this.onRoundWin();
        } else {
            this.handleLose();
        }

    }

    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        console.log(`Round ${this.roundIndex} win`);
        let isFinalWin = (this.roundIndex + 1 == this.targetRounds);
        this.gameState = isFinalWin ? 'gameWin' : 'roundWin';

        this.gameTimer.stop();
        this._calculateTiming(isFinalWin);
        this.enableGameInteraction(false);

        if (isFinalWin) {
            this.showFeedbackLabel(true);

            this.playVideoFeedback(true);
        } else {

            this.roundIndex++;
            this.resetForNewRound();
        }

        this.updateRoundUI(true);


    }

    handleLose() {
        this.isGameActive = false;
        this.gameState = 'lose';

        this.label = this.add.image(1650, 350, 'game_fail_label').setDepth(555);
        if (this.gameTimer) this.gameTimer.stop();
        this.enableGameInteraction(false);
        this.updateRoundUI(false);
        this.playVideoFeedback(false);
    }

    playVideoFeedback(isWin) {
        console.log('Playing video feedback, win:', isWin);
        this.cardGroup.setVisible(false);
        this.confirm_button.setVisible(false);

        if (isWin) {
            this.video = this.add.video(960, 540, `game7_success`).setDepth(100);
            this.video.play(true);

            this.time.delayedCall(1200, () => {
                this.showBubble('win');
            });
        } else {
            this.video = this.add.video(960, 540, `game7_fail`).setDepth(100);
            this.video.play(true);
            this.time.delayedCall(1200, () => {
                this.showBubble('tryagain');
            });
        }

    }

    onWinBubbleClose() {

        const dialogY = this.cameras.main.height * 0.8;
        this.dialog1 = this.add.image(960, dialogY, 'game7_npc_box_win1').setDepth(555);
        this.dialog1.setInteractive(
            { useHandCursor: true }
        );
        this.dialog1.once('pointerdown', () => {
            this.dialog1.destroy();
            this.dialog2 = this.add.image(960, dialogY, 'game7_npc_box_win2').setDepth(555);
            this.dialog2.setInteractive({ useHandCursor: true });
            this.dialog2.once('pointerdown', () => {
                this.showWinPanel();
            });
        });
    }

    showWinPanel() {
        const winPanel = new CustomPanel(this, 960, 540, [{
            content: 'game7_final_preview',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        winPanel.setDepth(1000);
        winPanel.show();
        winPanel.setCloseCallBack(
            () => GameManager.switchToGameScene(this, 'GameResultScene')
        );
    }

    resetForNewRound() {
        if (this.video) this.video.destroy();
        if (this.label) { this.label.destroy(); this.label = null; }

        this.randomCardPosition(this.cardGroup.getChildren());
        this.cardGroup.getChildren().forEach(card => {
            card.setData('isCorrect', false);
        });
        this.defaultCards.forEach(pos => {
            pos.occupiedBy = null;
        });
        this.cardGroup.setVisible(true);
        this.cardBg.setVisible(true);
        this.confirm_button.setVisible(true);

        this.gameState = 'playing';
        this.isGameActive = true;
        this.isChecked = false;

        this.enableGameInteraction(true);
    }

}