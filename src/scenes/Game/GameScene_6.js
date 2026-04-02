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

        this.width = this.cameras.main.width;
        this.height = this.cameras.main.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        this.load.image('game6_npc_box_mainstreet', `${path}game6_npc_box1.png`);

        this.load.image('game6_npc_box_win', `${path}game6_npc_box2.png`);
        this.load.image('game6_npc_box_tryagain', `${path}game6_npc_box3.png`);

        this.load.image('game6_hit_button', `${path}game6_click_button.png`);
        this.load.image('game6_hit_button_select', `${path}game6_click_button_select.png`)

        this.load.image('game6_object_description', path + 'game6_object_description.png');;

        this.gender = 'M';
        if (localStorage.getItem('player')) {
            this.gender = JSON.parse(localStorage.getItem('player')).gender;
        }

        if (this.gender === 'M') {

            this.load.image('game6_target_arrow', `${path}game6_arrow_boy.png`);

        } else {

            this.load.image('game6_target_arrow', `${path}game6_arrow_girl.png`);

        }

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game6_bar${i}`, `${path}game6_bar${i}.png`);
        }

    }

    create() {
        this.arrow = this.add.image(this.centerX, this.centerY - 100, 'game6_target_arrow')
            .setDepth(501).setVisible(true);

        this.bar = this.add.image(this.centerX, this.centerY + 100, 'game6_bar1')
            .setDepth(500).setVisible(true);

        this.initGame('game6_bg', 'game6_description', true, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 6
        });

    }

    update() {
        if (!this.arrow || this.isHit) return;

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
            { min: 450, max: 580 },  // Bar 1 success range
            { min: 1060, max: 1200 },  // Bar 2 success range
            { min: 720, max: 850 }   // Bar 3 success range
        ];

        this.hitButton = new CustomButton(this, 1720, 880,
            'game6_hit_button', 'game6_hit_button_select',
            () => this.handleHitButtonClick()
        )
            .setDepth(502);

        // Add hover effect to hit button
        this.hitButton.on('pointerover', () => {
            this.hitButton.setTexture('game6_hit_button_select');
        });

        this.hitButton.on('pointerout', () => {
            this.hitButton.setTexture('game6_hit_button');
        });

        //this.drawDebugRanges();
    }

    // drawDebugRanges() {
    //     const colors = [0x00ff00, 0x0088ff, 0xff8800];
    //     const labels = ['Bar 1', 'Bar 2', 'Bar 3'];
    //     const gfx = this.add.graphics().setDepth(600);

    //     this.hitRanges.forEach((range, i) => {
    //         gfx.fillStyle(colors[i], 0.25);
    //         gfx.fillRect(range.min, 0, range.max - range.min, this.height);
    //         gfx.lineStyle(2, colors[i], 0.8);
    //         gfx.strokeRect(range.min, 0, range.max - range.min, this.height);

    //         this.add.text(range.min + 4, 10 + i * 24, `${labels[i]}: ${range.min}–${range.max}`, {
    //             fontSize: '18px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    //         }).setDepth(601);
    //     });
    // }

    handleHitButtonClick() {
        if (this.isHit || !this.isGameActive) return; // Prevent multiple clicks

        this.isHit = true;
        this.arrowSpeed = 0;
        this.hitButton.setTexture('game6_hit_button'); // Reset button texture on click
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
        const barKeys = ['game6_bar1', 'game6_bar2', 'game6_bar3'];
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
            this.bar.setTexture('game6_bar1');
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
            content: 'game6_object_description',
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }]);
        objectPanel.setDepth(1000);
        objectPanel.show();
        objectPanel.setCloseCallBack(() => GameManager.backToMainStreet(this));
    }


}