import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';


export class GameScene_4 extends BaseGameScene {
    constructor() {
        super('GameScene_4');
    }

    preload() {
        const path = 'assets/images/Game_4/';

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.load.image('game4_npc_box_mainstreet', `${path}game4_npc_box1.png`);
        this.load.image('game4_npc_box_win', `${path}game4_npc_box2.png`);
        this.load.image('game4_npc_box_tryagain', `${path}game4_npc_box3.png`);

        for (let i = 1; i <= 9; i++) {
            this.load.image(`game4_card${i}`, `${path}game4_card${i}.png`);
        }

        this.load.image(`game4_card_bg`, `${path}game4_card_bg.png`);
        this.load.image('game4_additions', `${path}game4_additions.png`);
        this.load.image('game4_object_description', `${path}game4_object_description.png`);

        this.load.image('game4_confirm_button', `${path}game4_confirm_button.png`);
        this.load.image('game4_confirm_button_select', `${path}game4_confirm_button_select.png`);

    }

    create() {

        this.initGame('game4_bg', 'game4_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: true,
            isContinuousTimer: false,
            sceneIndex: 4
        });
        // this.gameUI.descriptionPanel.setVisible(false);
    }

    setupGameObjects() {
        this.isChecked = false; // Reset checking flag
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.image(centerX, centerY, 'game4_card_bg').setDepth(5);

        // Set 9 fixed card spawn positions
        this.spawnCardPositions = [
            { x: centerX - 550, y: centerY - 250, },
            { x: centerX - 200, y: centerY - 220, },
            { x: centerX - 600, y: centerY + 200, },
            { x: centerX - 250, y: centerY + 250, },
            { x: centerX + 100, y: centerY + 220, },
            { x: centerX + 350, y: centerY + 300, },
            { x: centerX + 100, y: centerY - 240, },
            { x: centerX + 400, y: centerY - 200, },
            { x: centerX + 600, y: centerY + 250, }
        ];

        this.defaultCards = [
            { id: 1, content: 'game4_card1', targetX: centerX - 680, targetY: centerY, occupiedBy: null },
            { id: 2, content: 'game4_card2', targetX: centerX - 520, targetY: centerY, occupiedBy: null },
            { id: 3, content: 'game4_card3', targetX: centerX - 350, targetY: centerY, occupiedBy: null },
            { id: 4, content: 'game4_card4', targetX: centerX - 180, targetY: centerY, occupiedBy: null },
            { id: 5, content: 'game4_card5', targetX: centerX, targetY: centerY, occupiedBy: null },
            { id: 6, content: 'game4_card6', targetX: centerX + 180, targetY: centerY, occupiedBy: null },
            { id: 7, content: 'game4_card7', targetX: centerX + 360, targetY: centerY, occupiedBy: null },
            { id: 8, content: 'game4_card8', targetX: centerX + 520, targetY: centerY, occupiedBy: null },
            { id: 9, content: 'game4_card9', targetX: centerX + 700, targetY: centerY, occupiedBy: null }
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
            'game4_confirm_button', 'game4_confirm_button_select',
            () => {
                if (this.isChecked) return;
                this.checkAllDone();
                this.isChecked = true;
            }, () => { });
        this.confirm_button.setActive(false);

        this.confirm_button.setDepth(100);

        //==== Debug Graphics ===========================================================
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

    enableGameInteraction(enable) {
        this.cardGroup.getChildren().forEach(card => {
            if (enable) {
                card.setInteractive({ draggable: true });
            } else {
                card.disableInteractive();
            }
        });
        this.confirm_button.setActive(enable);
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
                    card.setPosition(pos.targetX, pos.targetY);
                    pos.occupiedBy = card;
                    card.clearTint();
                }
            } else {
                if (pos.occupiedBy === card) {
                    pos.occupiedBy = null;
                    card.clearTint();
                }
            }
            //console.log('Target Position -', pos.id, ',current card', pos.occupiedBy ? pos.occupiedBy.texture.key : 'none');
        });
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
        const interchangeable = ['game4_card6', 'game4_card7'];

        this.defaultCards.forEach(cardInfo => {
            if (cardInfo.occupiedBy) {
                const placedKey = cardInfo.occupiedBy.texture.key;
                const targetKey = cardInfo.content;

                // Check if this slot allows interchangeable cards
                if (interchangeable.includes(targetKey) && interchangeable.includes(placedKey)) {
                    cardInfo.occupiedBy.setData('isCorrect', true);
                } else if (targetKey === placedKey) {
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

    showWin() {
        this.cardGroup.setVisible(false);
        this.confirm_button.setVisible(false);
        this.addOnImg = this.add.image(960, 600, 'game4_additions')
            .setInteractive({ useHandCursor: true }).setDepth(557);

        this.addOnImg.setVisible(true);
        this.addOnImg.once('pointerdown', () => {
            this.showObjectPanel();
        });
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game4_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }

    resetForNewRound() {
        this.randomCardPosition(this.cardGroup.getChildren());
        this.cardGroup.setVisible(true);

        this.cardGroup.getChildren().forEach(card => {
            card.setData('isCorrect', false);
        });
        this.defaultCards.forEach(pos => {
            pos.occupiedBy = null;
        });
        this.isChecked = false;
        this.enableGameInteraction(true);
    }



}
