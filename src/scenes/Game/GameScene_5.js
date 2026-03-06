
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


        this.load.image('game5_npc_box_win', `${path}game5_npc_box2.png`);
        this.load.image('game5_npc_box_tryagain', `${path}game5_npc_box3.png`);

        this.load.image('game5_normal_button', `${path}game5_normal_button.png`);
        this.load.image('game5_normal_button_click', `${path}game5_normal_button_select.png`);
        this.load.image('game5_hard_button', `${path}game5_hard_button.png`);
        this.load.image('game5_hard_button_click', `${path}game5_hard_button_select.png`);


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
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 + 50;

        this.isNormalMode = true;
        this.isChecked = false;

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        if (this.isNormalMode) {
            // Set 14 fixed card spawn positions (2 rows of 7)
            this.spawnCardPositions = [
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

            // Card pairs data (7 pairs = 14 cards)
            this.cardTypes_normal = [
                'game5_normalcard1_img', 'game5_normalcard1_text',
                'game5_normalcard2_img', 'game5_normalcard2_text',
                'game5_normalcard3_img', 'game5_normalcard3_text',
                'game5_normalcard4_img', 'game5_normalcard4_text',
                'game5_normalcard5_img', 'game5_normalcard5_text',
                'game5_normalcard6_img', 'game5_normalcard6_text',
                'game5_normalcard7_img', 'game5_normalcard7_text'
            ];



        }

        // Now call initGame which will call setupGameObjects
        this.initGame('game5_bg', 'game5_description', false, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 5
        });
    }


    setupGameObjects() {
        // Shuffle card types
        const shuffledTypes = Phaser.Utils.Array.Shuffle([...this.cardTypes_normal]);

        // Shuffle positions
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnCardPositions]);

        console.log('Creating cards at positions:', shuffledPositions);

        // Create cards at random positions
        shuffledTypes.forEach((cardType, index) => {
            const pos = shuffledPositions[index];

            // Create card container
            const card = this.add.container(pos.x, pos.y).setDepth(500);

            // Card back (initially visible)
            const cardBack = this.add.image(0, 0, 'game5_normalcard_back')
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

            // cardBack.on('pointerover', () => {
            //     cardBack.setTexture('game3_card_select');
            // });

            // cardBack.on('pointerout', () => {
            //     cardBack.setTexture('game3_card');
            // });

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
            scaleX: faceUp ? 1 : 1,
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
                console.log(`Matched pairs: ${this.matchedPairs}/7`);

                // Check if all 7 pairs matched - WIN!
                if (this.matchedPairs === 7) {
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

    showWin() {
        this.winPreview = this.add.image(this.centerX, this.centerY + 100, 'game3_preview').setDepth(1000)
            .setInteractive({ useHandCursor: true }).setScale(1.3)
            .on('pointerdown', () => {
                this.winPreview.destroy();
                this.showObjectPanel();
            });

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


}
