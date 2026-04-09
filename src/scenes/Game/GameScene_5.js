
import BaseGameScene from './BaseGameScene.js';
import { CustomButton } from '../../UI/Button.js';
import { CustomPanel, CustomFailPanel, QuestionPanel } from '../../UI/Panel.js';
import GameManager from '../GameManager.js';

export class GameScene_5 extends BaseGameScene {
    constructor() {
        super('GameScene_5');
    }

    preload() {

        const path = 'assets/images/Game_5/';

        this.load.image('game5_npc_box_mainstreet', `${path}game5_npc_box1.png`);
        this.load.image('game5_npc_box_win', `${path}game5_npc_box2.png`);
        this.load.image('game5_npc_box_tryagain', `${path}game5_npc_box3.png`);

        this.load.image('game5_normal_button', `${path}game5_normal_button.png`);
        this.load.image('game5_normal_button_click', `${path}game5_normal_button_select.png`);
        this.load.image('game5_hard_button', `${path}game5_hard_button.png`);
        this.load.image('game5_hard_button_click', `${path}game5_hard_button_select.png`);
        this.load.image('game5_mode_panel', `${path}game5_hardnormal_box.png`);

        this.load.image('game5_object_description', `${path}game5_object_description1.png`);
        this.load.image('game5_object_description1', `${path}game5_object_description1.png`);
        this.load.image('game5_object_description2', `${path}game5_object_description2.png`);

        //normal version
        const normalPath = 'assets/images/Game_5/normalversion/';
        this.load.image('game5_normal_success_preview', `${normalPath}game5_normal_success_preview.png`);
        this.load.image('game5_normalcard_back', `${normalPath}game5_normalcard_cover.png`);

        for (let i = 1; i <= 7; i++) {
            this.load.image(`game5_normalcard${i}_img`, `${normalPath}game5_normalcard${i}_large_img.png`);
            this.load.image(`game5_normalcard${i}_text`, `${normalPath}game5_normalcard${i}_large_text.png`);
        }

        const hardPath = 'assets/images/Game_5/hardversion/';
        this.load.image('game5_hard_success_preview', `${hardPath}game5_hard_success_preview.png`);
        this.load.image('game5_hardcard_back', `${hardPath}game5_hardcard_cover.png`);

        for (let i = 1; i <= 12; i++) {
            this.load.image(`game5_hardcard${i}_img`, `${hardPath}game5_hardcard${i}_large_img.png`);
            this.load.image(`game5_hardcard${i}_text`, `${hardPath}game5_hardcard${i}_large_text.png`);
        }

    }

    create() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2 + 100;

        const centerX = this.centerX;
        const centerY = this.centerY;

        this.isNormalMode = true;
        this.isSetMode = false;
        this.isChecked = false;

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        // Normal mode: 7 pairs = 14 cards (2 rows of 7)
        this.spawnCardPositions_normal = [
            { x: centerX - 600, y: centerY - 150 },
            { x: centerX - 400, y: centerY - 150 },
            { x: centerX - 200, y: centerY - 150 },
            { x: centerX, y: centerY - 150 },
            { x: centerX + 200, y: centerY - 150 },
            { x: centerX + 400, y: centerY - 150 },
            { x: centerX + 600, y: centerY - 150 },
            { x: centerX - 600, y: centerY + 150 },
            { x: centerX - 400, y: centerY + 150 },
            { x: centerX - 200, y: centerY + 150 },
            { x: centerX, y: centerY + 150 },
            { x: centerX + 200, y: centerY + 150 },
            { x: centerX + 400, y: centerY + 150 },
            { x: centerX + 600, y: centerY + 150 }
        ];
        this.cardTypes_normal = [
            'game5_normalcard2_img',  // position 1
            'game5_normalcard4_img',  // position 2
            'game5_normalcard1_img',  // position 3
            'game5_normalcard1_text', // position 4
            'game5_normalcard6_img',  // position 5
            'game5_normalcard4_text', // position 6
            'game5_normalcard7_text', // position 7
            'game5_normalcard5_text', // position 8
            'game5_normalcard2_text', // position 9
            'game5_normalcard7_img',  // position 10
            'game5_normalcard3_text', // position 11
            'game5_normalcard3_img',  // position 12
            'game5_normalcard6_text', // position 13
            'game5_normalcard5_img',  // position 14
        ];

        // Hard mode: 12 pairs = 24 cards (3 rows of 8, 200px col / 230px row spacing)
        this.spawnCardPositions_hard = [
            { x: centerX - 700, y: centerY - 230 },
            { x: centerX - 500, y: centerY - 230 },
            { x: centerX - 300, y: centerY - 230 },
            { x: centerX - 100, y: centerY - 230 },
            { x: centerX + 100, y: centerY - 230 },
            { x: centerX + 300, y: centerY - 230 },
            { x: centerX + 500, y: centerY - 230 },
            { x: centerX + 700, y: centerY - 230 },
            { x: centerX - 700, y: centerY },
            { x: centerX - 500, y: centerY },
            { x: centerX - 300, y: centerY },
            { x: centerX - 100, y: centerY },
            { x: centerX + 100, y: centerY },
            { x: centerX + 300, y: centerY },
            { x: centerX + 500, y: centerY },
            { x: centerX + 700, y: centerY },
            { x: centerX - 700, y: centerY + 230 },
            { x: centerX - 500, y: centerY + 230 },
            { x: centerX - 300, y: centerY + 230 },
            { x: centerX - 100, y: centerY + 230 },
            { x: centerX + 100, y: centerY + 230 },
            { x: centerX + 300, y: centerY + 230 },
            { x: centerX + 500, y: centerY + 230 },
            { x: centerX + 700, y: centerY + 230 }
        ];
        this.cardTypes_hard = [
            'game5_hardcard12_text', // position 1
            'game5_hardcard9_img',   // position 2
            'game5_hardcard8_img',   // position 3
            'game5_hardcard12_img',  // position 4
            'game5_hardcard2_img',   // position 5
            'game5_hardcard6_text',  // position 6
            'game5_hardcard9_text',  // position 7
            'game5_hardcard7_text',  // position 8
            'game5_hardcard11_img',  // position 9
            'game5_hardcard1_img',   // position 10
            'game5_hardcard10_text', // position 11
            'game5_hardcard2_text',  // position 12
            'game5_hardcard11_text', // position 13
            'game5_hardcard5_img',   // position 14
            'game5_hardcard3_text',  // position 15
            'game5_hardcard4_text',  // position 16
            'game5_hardcard5_text',  // position 17
            'game5_hardcard8_text',  // position 18
            'game5_hardcard6_img',   // position 19
            'game5_hardcard1_text',  // position 20
            'game5_hardcard4_img',   // position 21
            'game5_hardcard7_img',   // position 22
            'game5_hardcard3_img',   // position 23
            'game5_hardcard10_img',  // position 24
        ];

        // Now call initGame which will call setupGameObjects
        this.initGame('game5_bg', 'game5_description', true, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 5
        });

        this.gameUI.descriptionPanel?.setCloseCallBack(() => {
            this.showChooseModePanel();
        });
    }

    setupGameObjects() {

        if (!this.isSetMode) return;
        // prevent multiple setup when switching modes
        const cardTypes = this.isNormalMode ? this.cardTypes_normal : this.cardTypes_hard;
        const positions = this.isNormalMode ? this.spawnCardPositions_normal : this.spawnCardPositions_hard;
        const cardBackKey = this.isNormalMode ? 'game5_normalcard_back' : 'game5_hardcard_back';
        this.totalPairs = this.isNormalMode ? 7 : 12;

        // Create cards at fixed positions
        cardTypes.forEach((cardType, index) => {
            const pos = positions[index];

            // Create card container
            const card = this.add.container(pos.x, pos.y).setDepth(500);

            // Card back (initially visible)
            const cardBack = this.add.image(0, 0, cardBackKey)
                .setInteractive({ useHandCursor: true })
                .setVisible(true)
                .setScale(1);

            // Card front (hidden initially) - scale to match card back size
            const cardFront = this.add.image(0, 0, cardType)
                .setVisible(false)
                .setScale(0.55);

            card.add([cardBack, cardFront]);

            // Store card data
            card.cardType = cardType;
            card.cardBack = cardBack;
            card.cardFront = cardFront;
            card.isFlipped = false;
            card.isMatched = false;

            cardBack.on('pointerover', () => {
                cardBack.setScale(1.05);
            });

            cardBack.on('pointerout', () => {
                cardBack.setScale(1);
            });

            // Add click handler
            cardBack.on('pointerdown', () => this.onCardClick(card));

            this.cards.push(card);
        });

        console.log(`Created ${this.cards.length} cards`);
    }

    onCardClick(card) {
        if (!this.isGameActive || this.isChecking || card.isFlipped || card.isMatched) {
            return;
        }

        // Flip the card
        this.flipCard(card, true);
        this.flippedCards.push(card);

        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.isChecking = true;
            this.checkMatch();
        }
    }

    flipCard(card, faceUp) {
        card.isFlipped = faceUp;
        card.cardBack.setVisible(!faceUp);
        card.cardFront.setVisible(faceUp);

        // Optional: Add flip animation
        this.tweens.add({
            targets: card,
            scaleX: faceUp ? 0.8 : 1,
            scaleY: faceUp ? 0.8 : 1,
            duration: 150,
            ease: 'Linear'
        });
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        // Extract pair number (e.g., "game5_normalcard1_img" and "game5_normalcard1_text" are a match)
        const type1 = card1.cardType.replace(/_(img|text)$/, '');
        const type2 = card2.cardType.replace(/_(img|text)$/, '');

        if (type1 === type2) {
            // Match found!
            this.time.delayedCall(500, () => {
                card1.isMatched = true;
                card2.isMatched = true;

                // Make cards disappear with animation
                this.tweens.add({
                    targets: [card1, card2],
                    alpha: 0,
                    scale: 0.5,
                    duration: 300,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        card1.destroy();
                        card2.destroy();
                    }
                });

                // Increment matched pairs count
                this.matchedPairs++;
                console.log(`Matched pairs: ${this.matchedPairs}/${this.totalPairs}`);

                // Check if all pairs matched - WIN!
                if (this.matchedPairs === this.totalPairs) {
                    console.log('All pairs matched! You win!');
                    this.time.delayedCall(500, () => {
                        this.onRoundWin();
                    });
                }

                this.flippedCards = [];
                this.isChecking = false;
            });
        } else {
            // No match, flip back
            this.time.delayedCall(1000, () => {
                this.flipCard(card1, false);
                this.flipCard(card2, false);
                this.flippedCards = [];
                this.isChecking = false;
            });
        }
    }



    enableGameInteraction(enabled) {
        this.cards.forEach(card => {
            // Skip if card is destroyed or matched
            if (!card || card.isMatched || !card.cardBack) return;

            if (enabled) {
                card.cardBack.setInteractive();
            } else {
                card.cardBack.disableInteractive();
            }
        });
    }

    resetForNewRound() {
        // Destroy existing cards
        if (this.cards) {
            this.cards.forEach(card => card.destroy());
        }

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isChecking = false;

        // Recreate cards
        this.setupGameObjects();
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

        console.log(`Game won!`);

        if (this.isNormalMode) {
            this.winPreview = this.add.image(this.centerX, this.centerY, 'game5_normal_success_preview').setDepth(1000)
                .setInteractive({ useHandCursor: true }).setScale(1.1)
        } else {
            this.winPreview = this.add.image(this.centerX, this.centerY, 'game5_hard_success_preview').setDepth(1000)
                .setInteractive({ useHandCursor: true }).setScale(1.1)
        }
        this.winPreview.setInteractive({ useHandCursor: true }).setScale(1.1)
            .on('pointerdown', () => {
                this.winPreview.destroy();
                this.showBubble('win', this.playerGender);
            });

    }

    showWin() {
        this.showObjectPanel();
    }

    showObjectPanel() {
        const objectPanel = new CustomPanel(this, 960, 600, [
            { content: 'game5_object_description1' },
            { content: 'game5_object_description2' }
        ]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }

    showFailPanel() {
        const popupPanel = new CustomFailPanel(this, 960, 540, () => {
            popupPanel.destroy();
            this.isSetMode = false;
            this.restartGame();

            this.gameUI.descriptionPanel?.setCloseCallBack(() => this.showChooseModePanel());
        }, () => {
            GameManager.backToMainStreet(this);
        });
        popupPanel.setDepth(1000);
    }

    showChooseModePanel() {
        const { width, height } = this.cameras.main;

        this.modePanel = this.add.container(width / 2, height / 2).setDepth(2000);

        const bg = this.add.image(0, 0, 'game5_mode_panel');
        this.modePanel.add(bg);

        const normalBtn = new CustomButton(this, 0, 0,
            'game5_normal_button', 'game5_normal_button_click',
            () => {
                this.isNormalMode = true;
                this.isSetMode = true;
                this.modePanel.destroy();
                this.resetForNewRound();
                this.startGame();
            }
        );
        this.modePanel.add(normalBtn);

        const hardBtn = new CustomButton(this, 0, 200,
            'game5_hard_button', 'game5_hard_button_click',
            () => {
                this.isNormalMode = false;
                this.isSetMode = true;
                this.modePanel.destroy();
                this.resetForNewRound();
                this.startGame();
            }
        );
        this.modePanel.add(hardBtn);
    }
}
