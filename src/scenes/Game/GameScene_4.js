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

        this.load.image('game4_npc_box_intro', `${path}game4_npc_box5.png`);
        this.load.image('game4_npc_box_win', `${path}game4_npc_box3.png`);
        this.load.image('game4_npc_box_tryagain', `${path}game4_npc_box4.png`);

        this.load.image('game4_hit_button', `${path}game4_click_button.png`);
        this.load.image('game4_hit_button_select', `${path}game4_click_button_select.png`);
        this.load.image('game4_target_arrow', `${path}game4_arrow.png`);

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game4_q${i}`, `${path}game4_q${i}.png`);
            this.load.image(`game4_q${i}_bar`, `${path}game4_q${i}_bar.png`);
        }

    }

    create() {
        this.arrow = this.add.image(this.centerX, this.centerY - 100, 'game4_target_arrow')
            .setDepth(501).setVisible(true);

        this.bar = this.add.image(this.centerX, this.centerY + 100, 'game4_q1_bar')
            .setDepth(500).setVisible(true);

        this.initGame('game4_bg', 'game4_description', false, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 4
        });

        this.allowToStart = false;

    }

    update() {
        if (!this.arrow || this.isHit || !this.allowToStart) return;

        // Bouncing logic
        this.arrow.x += this.arrowSpeed;

        if (this.arrow.x >= 1580) {
            this.arrow.x = 1580;
            this.arrowSpeed = -Math.abs(this.arrowSpeed); // Turn left
        } else if (this.arrow.x <= 350) {
            this.arrow.x = 350;
            this.arrowSpeed = Math.abs(this.arrowSpeed); // Turn right
        }
    }

    setupGameObjects() {
        this.arrowSpeed = 10; // Initial speed of the arrow
        this.isHit = false;
        this.successfulHits = 0; // Track number of successful hits

        // Define success ranges for each bar (min and max x positions)
        this.hitRanges = [
            { min: 200, max: 650 },  // Bar 1 success range
            { min: 1250, max: 1550 },  // Bar 2 success range
            { min: 650, max: 1050 }   // Bar 3 success range
        ];

        this.hitButton = new CustomButton(this, 1720, 880,
            'game4_hit_button', 'game4_hit_button_select',
            () => this.handleHitButtonClick()
        )
            .setDepth(502);

        // Add hover effect to hit button
        this.hitButton.on('pointerover', () => {
            this.hitButton.setTexture('game4_hit_button_select');
        });

        this.hitButton.on('pointerout', () => {
            this.hitButton.setTexture('game4_hit_button');
        });
    }

    handleHitButtonClick() {
        if (this.isHit || !this.isGameActive) return; // Prevent multiple clicks

        this.isHit = true;
        this.arrowSpeed = 0;
        this.hitButton.setTexture('game4_hit_button'); // Reset button texture on click
        this.checkHitSuccess();
    }

    checkHitSuccess() {
        const currentBarIndex = this.successfulHits; // 0, 1, or 2
        const range = this.hitRanges[currentBarIndex];
        const arrowX = this.arrow.x;

        console.log(`Arrow at x=${arrowX}, Range: ${range.min}-${range.max}`);

        // Check if arrow is within the success range
        if (arrowX >= range.min && arrowX <= range.max) {
            this.onRoundWin();
        } else {
            console.log('Hit failed - outside range');
            // Update roundIndex to current attempt so correct UI element is marked as failed
            this.roundIndex = this.successfulHits;
            this.time.delayedCall(500, () => {
                this.handleLose();
            });
        }
    }

    /**
     * Override: Called when a round/game is won
     */
    onRoundWin() {
        if (!this.isGameActive || this.gameState === 'gameWin') return;

        // Increment successful hits
        this.successfulHits++;
        console.log(`Hit ${this.successfulHits}/3 successful!`);

        // Sync roundIndex with successfulHits for proper round UI update
        this.roundIndex = this.successfulHits - 1;

        // Determine if this is the last round (3rd successful hit)
        let isGameWin = (this.successfulHits >= this.targetRounds);
        console.log('遊戲狀態改為:', isGameWin ? 'gameWin' : 'roundWin');

        this.gameState = isGameWin ? 'gameWin' : 'roundWin';

        if (this.gameTimer) this.gameTimer.stop();

        if (this.gameTimer && typeof this.gameTimer.getRemaining === 'function') {
            if (this.isContinuousTimer) {
                if (isGameWin) {
                    this.totalUsedSeconds = Math.max(0, this.roundPerSeconds - this.gameTimer.getRemaining());
                }
            } else {
                const used = Math.max(0, this.roundPerSeconds - this.gameTimer.getRemaining());
                this.totalUsedSeconds += used;
            }
        }

        this.enableGameInteraction(false);
        this.updateRoundUI(true);

        // Show feedback and bubble
        if (isGameWin) {

            this.label = this.add.image(1650, 350, 'game_success_label').setDepth(555);
            this.showBubble('win', this.playerGender);
        } else {

            this.showBubble('noBubble', this.playerGender);
        }
    }

    /**
     * Override: Called when win bubble is closed - moves to next bar or ends game
     */
    onWinBubbleClose() {
        if (!this.isGameActive) return;

        if (this.gameState === 'roundWin') {
            // For round win, move to next bar instead of nextRound()
            this.time.delayedCall(500, () => {
                this.nextBar();
            });

        } else if (this.gameState === 'gameWin') {
            // Save game result
            if (this.sceneIndex > 0) {
                GameManager.saveGameResult(this.sceneIndex, true, this.totalUsedSeconds);
                console.log(`遊戲 ${this.sceneIndex} 結束，總用時: ${this.totalUsedSeconds} 秒`);
            }
            this.showWin();
            this.isGameActive = false;
            this.gameState = 'completed';
        }
    }

    nextBar() {
        // Reset for next round
        this.isHit = false;
        this.arrow.x = this.centerX;
        this.arrowSpeed = 10;

        // Update bar image for next question
        const barKeys = ['game4_q1_bar', 'game4_q2_bar', 'game4_q3_bar'];
        this.bar.setTexture(barKeys[this.successfulHits]);

        console.log(`Moving to bar ${this.successfulHits + 1}`);

        // Clear feedback label
        if (this.feedbackLabel) {
            this.feedbackLabel.destroy();
            this.feedbackLabel = null;
        }

        // Re-enable interaction and continue playing
        this.gameState = 'playing';
        this.isGameActive = true;
        this.enableGameInteraction(true);

        // Resume timer if continuous
        if (this.gameTimer && this.isContinuousTimer) {
            this.gameTimer.start();
        }
    }

    resetForNewRound() {
        // Reset game state
        this.isHit = false;
        this.successfulHits = 0;
        this.arrowSpeed = 10;

        if (this.arrow) {
            this.arrow.x = this.centerX;
        }

        if (this.bar) {
            this.bar.setTexture('game4_q1_bar');
        }
    }

    enableGameInteraction(enabled) {
        if (this.hitButton) {
            if (enabled) {
                this.hitButton.setInteractive();
            } else {
                this.hitButton.disableInteractive();
            }
        }
        this.allowToStart = enabled;
    }

    showWin() {
        this.showObjectPanel();
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


}
