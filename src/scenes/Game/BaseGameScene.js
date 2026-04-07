import { CustomButton } from '../../UI/Button.js';
import UIHelper from '../../UI/UIHelper.js';
import GameManager from '../GameManager.js';
import { CustomPanel, CustomFailPanel } from '../../UI/Panel.js';

/**
 * Enhanced BaseGameScene
 * Features: Centralized Sound, State Management, and Lifecycle Hooks for 7 Mini-Games
 */
export default class BaseGameScene extends Phaser.Scene {
    constructor(key) {
        super(key);

        // --- Core Configuration (Can be overridden in init) ---
        this.config = {
            depthUI: 1000,
            depthBubble: 1500,
            depthFeedback: 1000,
            roundDuration: 30,
            targetRounds: 3,
            isAllowRoundFail: false,
            isContinuousTimer: false
        };

        // --- Game State ---
        this.gameState = 'init'; // 'init', 'playing', 'paused', 'roundWin', 'gameWin', 'lose', 'gameLose'
        this.roundIndex = 0;
        this.totalUsedSeconds = 0;
        this.isGameActive = false;

        // --- References ---
        this.gameUI = null;
        this.gameTimer = null;
        this.currentBubbleImg = null;
        this.feedbackLabel = null;
    }

    /**
     * @param {Object} data - Configuration object from the calling script
     */
    init(data = {}) {
        // Merge passed data with default config
        this.config = { ...this.config, ...data };
        this.targetRounds = this.config.targetRounds;
        this.roundPerSeconds = this.config.roundDuration;
        this.isAllowRoundFail = this.config.isAllowRoundFail;
        this.isContinuousTimer = this.config.isContinuousTimer;
    }

    /**
     * Unified Initialization
     * @param {string|null} bgKey - Background image key (null if using video background)
     * @param {string|array} descriptionKey - Description panel content key(s)
     * @param {boolean} skipIntroBubble - Skip intro bubble
     * @param {boolean} autoStart - Auto start game
     * @param {object} customConfig - Custom configuration object
     */
    initGame(bgKey, descriptionKey, skipIntroBubble = false, autoStart = false, customConfig = {}) {

        if (customConfig) {
            this.targetRounds = customConfig.targetRounds ?? this.targetRounds;
            this.roundPerSeconds = customConfig.roundPerSeconds ?? this.roundPerSeconds;
            this.isAllowRoundFail = customConfig.isAllowRoundFail ?? this.isAllowRoundFail;
            this.sceneIndex = customConfig.sceneIndex ?? this.sceneIndex;
        }
        console.log('Game Config:', {
            targetRounds: this.targetRounds,
            roundPerSeconds: this.roundPerSeconds,
            isAllowRoundFail: this.isAllowRoundFail,
            isContinuousTimer: this.isContinuousTimer
        });

        this.gameState = 'init';
        this.roundIndex = 0;
        this.totalUsedSeconds = 0;

        let player = { gender: 'F' }; // Default to Female
        try {
            const stored = localStorage.getItem('player');
            if (stored) {
                player = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error parsing player data", e);
        }
        this.playerGender = player.gender; // Store gender for use in win bubbles
        const descriptionPages = this._formatDescription(descriptionKey);

        this.gameUI = UIHelper.createGameCommonUI(this, bgKey,
            descriptionPages, this.targetRounds, this.config.depthUI);

        this.gameUI.descriptionPanel.show();

        console.log('Game UI Initialized , Gender:', this.playerGender);

        this._setupTimer();
        this.setupGameObjects();
        this._handleEntryFlow(skipIntroBubble, autoStart, player.gender);
    }

    // --- Internal Logic ---

    /**
        * 2. 泡泡對話系統 (整合 Init, Success, Fail 狀態)
        */
    /**
     * Show a bubble (intro, win, tryagain) and handle its logic.
     * @param {'intro'|'win'|'tryagain'} type
     * @param {string|null} gender
     * @param {object} options - { autoCloseMs: number, onClose: function }
     */
    showBubble(type, gender = null, options = {}) {
        if (this.currentBubbleImg) {
            this.currentBubbleImg.destroy();
            this.currentBubbleImg = null;
        }
        const centerX = this.cameras.main.width / 2;
        // Adaptive Y: 20% from bottom for win/tryagain, 80% for intro
        const centerY = (type === 'intro') ? this.cameras.main.height * 0.8 : this.cameras.main.height * 0.8;
        const prefix = this.sceneIndex !== -1 ? `game${this.sceneIndex}` : 'game1';
        const bubbleMapping = {
            'intro': `${prefix}_npc_box_intro`,
            'win': `${prefix}_npc_box_win`,
            'win_gender': `${prefix}_npc_box_win_gender`, // optional
            'gameWin': `${prefix}_npc_box_win`, // fallback to win bubble, can customize if needed
            'tryagain': `${prefix}_npc_box_tryagain`,
            'tryagain2': `${prefix}_npc_box_tryagain2`,
            'lock': `${prefix}_npc_box_lock`
        };

        let targetKey = bubbleMapping[type];

        // Check for gender-specific or round-specific win bubble
        if (type === 'win' || type === 'gameWin') {
            // First priority: gender-specific win bubble (e.g., game1_npc_box_boy_win)
            if (gender) {
                const genderKey = gender === 'M' ? 'boy' : 'girl';
                const genderWinKey = `${prefix}_npc_box_${genderKey}_win`;
                if (this.textures.exists(genderWinKey)) {
                    targetKey = genderWinKey;
                }
            }
            // Second priority: round-specific win bubble (e.g., game6_npc_box_win_round2)
            if (targetKey === bubbleMapping[type]) {
                const specificRoundKey = `${prefix}_npc_box_win_round${this.roundIndex + 1}`;
                if (this.textures.exists(specificRoundKey)) {
                    targetKey = specificRoundKey;
                }
            }
        }

        this.currentBubbleImg = this.add.image(centerX, centerY, targetKey)
            .setDepth(this.config.depthBubble)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true });
        this.tweens.add({
            targets: this.currentBubbleImg,
            scale: { from: 0.5, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
        });
        let closed = false;
        const closeBubble = () => {
            if (closed) return;
            closed = true;
            if (this.currentBubbleImg) {
                this.currentBubbleImg.destroy();
                this.currentBubbleImg = null;
            }
            if (options.onClose) options.onClose();
        };
        if (type === 'intro') {
            this.currentBubbleImg.once('pointerdown', () => {
                closeBubble();
                this.startGame();
            });
        } else if (type === 'win') {
            this.currentBubbleImg.once('pointerdown', () => {
                if (this.successVideo) this.successVideo.destroy();
                closeBubble();
                this.onWinBubbleClose();
            });
            if (options.autoCloseMs) {
                this.time.delayedCall(options.autoCloseMs, () => {
                    if (!closed) {
                        closeBubble();
                        this.onWinBubbleClose();
                    }
                });
            }
        } else if (type === 'tryagain' || type === 'tryagain2') {
            this.currentBubbleImg.once('pointerdown', () => {
                closeBubble();

                // Logic: 
                // 1. If isAllowRoundFail (consume rounds as chances):
                //    - If we have rounds left, go nextRound().
                //    - Else, Fail Panel.
                // 2. Else (original sequential logic, or separate failChances logic):
                //    - Default to Fail Panel immediately for now unless failChances used.

                if (this.isAllowRoundFail) {
                    if (this.roundIndex + 1 < this.targetRounds) {
                        this.nextRound();
                    } else {
                        this.showLose(() => {
                            this.showFailPanel();
                        });
                    }
                } else {
                    this.showLose(() => {
                        this.showFailPanel();
                    });
                }
            });

        } else if (type === 'lock') {
            this.currentBubbleImg.once('pointerdown', () => {
                closeBubble();
                GameManager.backToMainStreet(this);
            });

            if (options.autoCloseMs) {
                this.time.delayedCall(options.autoCloseMs, () => {
                    closeBubble();
                    GameManager.backToMainStreet(this);
                });
            }
        } else if (type === 'noBubble') {
            this.onWinBubbleClose();
        }
    }

    _formatDescription(key) {
        const keys = Array.isArray(key) ? key : [key];
        return keys.map(k => ({
            content: k,
            closeBtn: 'close_btn',
            closeBtnClick: 'close_btn_click'
        }));
    }

    _setupTimer() {
        if (this.roundPerSeconds > 0) {
            this.gameTimer = UIHelper.showTimer(this, this.roundPerSeconds, () => {
                console.log('[Timer] Time expired, calling handleLose');
                if (this.isGameActive && this.gameState === 'playing') {
                    this.handleLose();
                }
            });
        } else {
            this.gameTimer = { start: () => { }, stop: () => { }, reset: () => { }, getRemaining: () => 0 };
        }
    }

    _handleEntryFlow(skip, auto, gender) {
        const startAction = () => {
            if (skip && auto) this.startGame();
            else if (skip) this.gameUI.descriptionPanel?.setCloseCallBack(() => this.startGame());
            else this.gameUI.descriptionPanel?.setCloseCallBack(() => this.showBubble('intro', gender));
        };
        startAction();
    }

    // --- Life Cycle Management ---

    startGame() {
        if (this.gameState === 'playing') return;

        this.gameUI.descriptionPanel?.setCloseCallBack(() => { });

        this.gameState = 'playing';
        this.isGameActive = true;
        this.gameTimer.start();
        this.enableGameInteraction(true);
        this.events.emit('game-start', this.roundIndex);
        console.log(`[Game] Round ${this.roundIndex + 1} Started`);
    }

    pauseGame() {
        this.isGameActive = false;
        this.gameTimer.stop();
        this.enableGameInteraction(false);
        this.gameState = 'paused';
    }

    /**
     * Called when a round/game is won - processes win condition and shows win bubble
     */
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
        this.showBubble('win', this.playerGender);
        //this.playFeedback(true, () =>);
    }

    _calculateTiming(isFinalWin) {
        if (!this.gameTimer?.getRemaining) return;

        const used = Math.max(0, this.roundPerSeconds - this.gameTimer.getRemaining());
        if (this.isContinuousTimer) {
            if (isFinalWin) this.totalUsedSeconds = used;
        } else {
            this.totalUsedSeconds += used;
            if (isFinalWin) return;
            this.gameTimer.reset(this.roundPerSeconds);
        }
    }

    /**
     * Called when win bubble is closed/clicked - continues to next round or ends game
     */
    onWinBubbleClose() {
        if (!this.isGameActive) return;
        if (this.gameState === 'roundWin') {
            this.nextRound();
        } else {
            if (this.gameState === 'gameWin') {
                // Save game result
                if (this.sceneIndex > 0) {
                    GameManager.saveGameResult(this.sceneIndex, true, this.totalUsedSeconds);
                    console.log(`遊戲 ${this.sceneIndex} 結束，總用時: ${this.totalUsedSeconds} 秒`);
                }
                this.showWin();
                this.isGameActive = false;
                this.gameState = 'completed';
                if (typeof this.onGameWin === 'function') this.onGameWin();
            }
        }
    }

    /**
     * Visual Feedback Hook (e.g. "Excellent!" or "Keep Trying")
     */
    showFeedbackLabel(isSuccess) {
        const key = isSuccess ? 'game_success_label' : 'game_fail_label';
        if (this.feedbackLabel) this.feedbackLabel.destroy();

        this.feedbackLabel = this.add.image(1650, 350, key)
            .setDepth(this.config.depthFeedback)
            .setScale(0);

        this.tweens.add({
            targets: this.feedbackLabel,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
    }

    handleLose() {
        // Prevent multiple entries
        if (this.gameState === 'gameLose') return;

        this.currentFailCount = (this.currentFailCount || 0) + 1; // Increment fail count

        // In AllowRoundFail mode, losing a round doesn't mean Game Over unless we are out of rounds
        if (this.isAllowRoundFail) {
            this.isGameActive = false;
            this.gameState = 'roundLose';

            if (this.gameTimer) this.gameTimer.stop();
            this.enableGameInteraction(false);
            this.updateRoundUI(false);

            // Check if this was the last round (Game Over) or just a round loss
            if (this.roundIndex + 1 >= this.targetRounds) {
                this.gameState = 'gameLose'; // Will trigger Fail Panel after bubble
                this.label = this.add.image(1650, 350, 'game_fail_label').setDepth(555);
            }

            this.showBubble('tryagain');
        } else {
            // Standard Logic
            this.isGameActive = false;
            this.gameState = 'lose';

            this.label = this.add.image(1650, 350, 'game_fail_label').setDepth(555);
            if (this.gameTimer) this.gameTimer.stop();
            this.enableGameInteraction(false);
            this.updateRoundUI(false);
            this.showBubble('tryagain');
        }

    }
    updateRoundUI(isSuccess) {
        // Reverse order to update from Left to Right
        if (this.gameUI?.roundStates) {
            const index = this.gameUI.roundStates.length - 1 - this.roundIndex;
            const state = this.gameUI.roundStates[index];
            if (state) {
                state.content.setTexture(isSuccess ? 'success_chance' : 'fail_chance');
                state.isSuccess = isSuccess;
            }
        }
    }

    showFailPanel() {
        // 確保這是在所有東西的最上層
        const popupPanel = new CustomFailPanel(this, 960, 540, () => {
            popupPanel.destroy();
            this.restartGame(); // 重新開始整個遊戲
        }, () => {
            GameManager.backToMainStreet(this);
        });
        popupPanel.setDepth(1000);
    }

    /**
     * Restart the entire game from the beginning
     */
    restartGame() {
        // 1. Reset state variables
        this.gameState = 'init';
        this.roundIndex = 0;
        this.totalUsedSeconds = 0;
        this.isGameActive = false;
        this.currentFailCount = 0;

        // 2. Destroy and recreate timer (because timer event is destroyed when it reaches 0)
        if (this.gameTimer && this.gameTimer.destroy) {
            this.gameTimer.destroy();
        }
        this._setupTimer();

        // 3. Clear bubbles and feedback labels
        if (this.currentBubbleImg) {
            this.currentBubbleImg.destroy();
            this.currentBubbleImg = null;
        }
        if (this.feedbackLabel) {
            this.feedbackLabel.destroy();
            this.feedbackLabel = null;
        }
        if (this.label) {
            this.label.destroy();
            this.label = null;
        }

        // 4. Reset round UI icons back to initial state
        if (this.gameUI?.roundStates) {
            this.gameUI.roundStates.forEach(state => {
                state.content.setTexture('game_gamechance');
                state.isSuccess = null;
            });
        }

        // 5. Disable game interaction
        this.enableGameInteraction(false);

        // 6. Call subclass-specific reset
        this.resetForNewRound();

        // 7. Re-apply init state after subclass reset (subclass may set gameState to 'playing')
        this.gameState = 'init';
        this.isGameActive = false;
        this.enableGameInteraction(false);

        // 8. Re-show description panel to restart the flow
        if (this.gameUI?.descriptionPanel) {
            this.gameUI.descriptionPanel.show();
            // Set callback to start game when panel is closed (skip intro since already shown)
            this.gameUI.descriptionPanel.setCloseCallBack(() => this.startGame());
        }

        console.log('[Game] Whole game reset - restarting from beginning');
    }

    /**
     * Move to next round (for multi-round games)
     */
    nextRound() {
        this.roundIndex++;
        this.gameState = 'init';
        this.isGameActive = false;

        // Reset timer for new round
        if (this.gameTimer && !this.isContinuousTimer) {
            this.gameTimer.reset(this.roundPerSeconds);
        }

        // Clear any feedback
        if (this.feedbackLabel) {
            this.feedbackLabel.destroy();
            this.feedbackLabel = null;
        }

        // Start new round
        this.startGame();

        console.log(`[Game] Starting Round ${this.roundIndex + 1}`);
    }

    // --- Abstract Hooks (To be implemented by your 7 games) ---

    setupGameObjects() {
        // Example: this.add.sprite(...) or this.physics.add.group(...)
    }

    enableGameInteraction(enabled) {
        // Example: input.setDraggable(...)
    }

    resetForNewRound() {
        // Example: reset sprite positions
    }
    showObjectPanel() { }

    showWin() { }

    showLose(onComplete) {
        if (onComplete) onComplete();
    }
    // --- Utilities ---

    /**
     * Cleans up the scene to prevent memory leaks
     */
    shutdown() {
        if (this.gameTimer) this.gameTimer.stop();
        this.tweens.killAll();
        this.events.off('game-start');
    }
}