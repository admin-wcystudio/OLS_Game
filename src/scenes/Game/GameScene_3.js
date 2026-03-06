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
        this.centerY = this.height / 2;

        this.load.image('game3_npc_box_intro', `${path}game3_npc_box3.png`);
        this.load.image('game3_card', `${path}game3_card.png`);
        this.load.image('game3_card_select', `${path}game3_card_select.png`);

        this.load.image('game3_card1a', `${path}game3_card1a.png`);
        this.load.image('game3_card1b', `${path}game3_card1b.png`);
        this.load.image('game3_card2a', `${path}game3_card2a.png`);
        this.load.image('game3_card2b', `${path}game3_card2b.png`);
        this.load.image('game3_card3a', `${path}game3_card3a.png`);
        this.load.image('game3_card3b', `${path}game3_card3b.png`);
        this.load.image('game3_card4a', `${path}game3_card4a.png`);
        this.load.image('game3_card4b', `${path}game3_card4b.png`);
        this.load.image('game3_card5a', `${path}game3_card5a.png`);
        this.load.image('game3_card5b', `${path}game3_card5b.png`);

        this.load.image('game3_npc_box_intro', `${path}game3_npc_box3.png`);
        this.load.image('game3_npc_box_win', `${path}game3_npc_box4.png`);
        this.load.image('game3_npc_box_tryagain', `${path}game3_npc_box5.png`);
        this.load.image('game3_preview', `${path}game3_success_preview1.png`);

    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 + 50;

        // Initialize game data before initGame (which calls setupGameObjects)
        this.isChecked = false;

        // Set 10 fixed card spawn positions (2 rows of 5)
        this.spawnCardPositions = [
            { x: centerX - 500, y: centerY - 150 },
            { x: centerX - 250, y: centerY - 150 },
            { x: centerX, y: centerY - 150 },
            { x: centerX + 250, y: centerY - 150 },
            { x: centerX + 500, y: centerY - 150 },
            { x: centerX - 500, y: centerY + 150 },
            { x: centerX - 250, y: centerY + 150 },
            { x: centerX, y: centerY + 150 },
            { x: centerX + 250, y: centerY + 150 },
            { x: centerX + 500, y: centerY + 150 }
        ];

        // Card pairs data (5 pairs = 10 cards)
        this.cardTypes = [
            'game3_card1a', 'game3_card1b',
            'game3_card2a', 'game3_card2b',
            'game3_card3a', 'game3_card3b',
            'game3_card4a', 'game3_card4b',
            'game3_card5a', 'game3_card5b'
        ];

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;

        // Now call initGame which will call setupGameObjects
        this.initGame('game3_bg', 'game3_description', false, false, {
            targetRounds: 1,
            roundPerSeconds: 120,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 3
        });
    }

    setupGameObjects() {
        // Shuffle card types
        const shuffledTypes = Phaser.Utils.Array.Shuffle([...this.cardTypes]);

        // Shuffle positions
        const shuffledPositions = Phaser.Utils.Array.Shuffle([...this.spawnCardPositions]);

        console.log('Creating cards at positions:', shuffledPositions);

        // Create cards at random positions
        shuffledTypes.forEach((cardType, index) => {
            const pos = shuffledPositions[index];

            // Create card container
            const card = this.add.container(pos.x, pos.y).setDepth(500);

            // Card back (initially visible)
            const cardBack = this.add.image(0, 0, 'game3_card')
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
                cardBack.setTexture('game3_card_select');
            });

            cardBack.on('pointerout', () => {
                cardBack.setTexture('game3_card');
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
            scaleX: faceUp ? 1 : 1,
            duration: 150,
            ease: 'Linear'
        });
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        // Extract pair number (e.g., "card1a" and "card1b" are a match)
        const type1 = card1.cardType.replace(/[ab]$/, '');
        const type2 = card2.cardType.replace(/[ab]$/, '');

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
                console.log(`Matched pairs: ${this.matchedPairs}/5`);

                // Check if all 5 pairs matched - WIN!
                if (this.matchedPairs === 5) {
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
        const objectPanel = new CustomPanel(this, 960, 600, [{
            content: 'game3_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }

}
