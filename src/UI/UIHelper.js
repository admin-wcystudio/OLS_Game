import { CustomButton } from './Button.js';
import { CustomPanel, ItemsPanel, SettingPanel } from './Panel.js';

export default class UIHelper {
    // Shared UI Depth Constants
    static DEPTH = {
        BG: 1,
        TITLE: 3,
        BUTTONS: 1000,
        PANELS: 1100,
        TOAST: 2000
    };

    /**
     * Internal helper to handle the exclusive opening of panels
     */
    static #managePanels(panels, buttons) {
        const openPanel = (targetPanel, activeBtn) => {
            // Hide all panels using the new .hide() method from our enhanced Panel.js
            panels.forEach(p => {
                if (p && p !== targetPanel) p.setVisible(false);
            });

            // Reset all button states except the active one
            buttons.forEach(btn => {
                if (btn !== activeBtn) btn.resetStatus?.();
            });

            // Show target
            if (targetPanel) {
                // If using the enhanced Panel.js, we use .show(), otherwise setVisible
                if (targetPanel.show) targetPanel.show();
                else targetPanel.setVisible(true);

                if (targetPanel.refresh) targetPanel.refresh();
            }
        };

        // Link buttons to panels
        buttons.forEach((btn, index) => {
            const linkedPanel = panels[index];
            if (!linkedPanel) return;

            linkedPanel.toggleBtn = btn;
            btn.needClicked = true;

            // Assign the toggle logic
            btn.cbDown = () => openPanel(linkedPanel, btn);
            btn.cbUp = () => linkedPanel.hide ? linkedPanel.hide() : linkedPanel.setVisible(false);
        });
    }

    static createCommonUI(scene, programPages, descriptionPages, depthOffset = 0) {
        const baseDepth = this.DEPTH.PANELS + depthOffset;

        // 1. Initialize Panels
        const panels = [
            new SettingPanel(scene, 960, 540).setDepth(baseDepth).setScrollFactor(0),
            new CustomPanel(scene, 960, 540, descriptionPages).setDepth(baseDepth).setScrollFactor(0),
            new CustomPanel(scene, 960, 540, programPages).setDepth(baseDepth).setScrollFactor(0)
        ];

        // 2. Initialize Buttons
        const buttons = [
            new CustomButton(scene, 100, 100, 'setting_btn', 'setting_btn_click').setDepth(this.DEPTH.BUTTONS).setScrollFactor(0),
            new CustomButton(scene, 250, 100, 'desc_button', 'desc_button_click').setDepth(this.DEPTH.BUTTONS).setScrollFactor(0),
            new CustomButton(scene, 400, 100, 'program_btn', 'program_btn_click').setDepth(this.DEPTH.BUTTONS).setScrollFactor(0)
        ];

        // 3. Apply Management Logic
        this.#managePanels(panels, buttons);

        return {
            settingBtn: buttons[0], descBtn: buttons[1], programBtn: buttons[2],
            settingPanel: panels[0], descriptionPanel: panels[1], programPanel: panels[2]
        };
    }

    static createGameCommonUI(scene, bgKey, descriptionPages, targetRounds = 3) {
        const { width, height } = scene.scale;

        if (bgKey) scene.add.image(width / 2, height / 2, bgKey).setDepth(this.DEPTH.BG);

        // UI Setup
        const panels = [
            new SettingPanel(scene, 960, 540).setDepth(this.DEPTH.PANELS).setScrollFactor(0),
            new CustomPanel(scene, 960, 540, descriptionPages).setDepth(this.DEPTH.PANELS).setScrollFactor(0),
            new ItemsPanel(scene, 960, 540).setDepth(this.DEPTH.PANELS).setScrollFactor(0)
        ];

        const buttons = [
            new CustomButton(scene, 100, 100, 'setting_btn', 'setting_btn_click').setDepth(this.DEPTH.BUTTONS).setScrollFactor(0),
            new CustomButton(scene, 250, 100, 'desc_button', 'desc_button_click').setDepth(this.DEPTH.BUTTONS).setScrollFactor(0),
            new CustomButton(scene, 400, 100, 'gameintro_bag', 'gameintro_bag_click').setDepth(this.DEPTH.BUTTONS).setScrollFactor(0)
        ];

        this.#managePanels(panels, buttons);


        // Round/Life Icons logic
        const roundStates = [];
        for (let i = 0; i < targetRounds; i++) {
            const icon = scene.add.image(1755 - (i * 145), 200, 'game_gamechance')
                .setScale(0.8)
                .setDepth(1000);
            roundStates.push({ round: i + 1, content: icon, isSuccess: false });
        }

        return {
            settingBtn: buttons[0], descBtn: buttons[1], itemBtn: buttons[2], roundStates
            , descriptionPanel: panels[1]
        };
    }

    // ================== UTILITIES ==================

    static showToast(scene, message, color = '#ff0000') {
        const toast = scene.add.text(960, 800, message, {
            fontSize: '32px',
            color: color,
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(this.DEPTH.TOAST);

        scene.tweens.add({
            targets: toast,
            y: 750,
            alpha: 0,
            delay: 1500,
            duration: 500,
            onComplete: () => toast.destroy()
        });
    }

    static showTimer(scene, seconds, onComplete) {
        const timerBg = scene.add.image(1640, 80, 'game_timer_bg').setDepth(this.DEPTH.BUTTONS);

        let timeLeft = seconds;
        const timerText = scene.add.text(1640, 80, this.#formatTime(timeLeft), {
            fontSize: '60px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(this.DEPTH.BUTTONS + 1);

        const timerEvent = scene.time.addEvent({
            delay: 1000,
            callback: () => {
                timeLeft--;
                timerText.setText(this.#formatTime(timeLeft));
                if (timeLeft <= 0) {
                    timerEvent.destroy();
                    if (onComplete) onComplete();
                }
            },
            loop: true,
            paused: true  // Start paused, will be resumed when start() is called
        });

        return {
            stop: () => timerEvent.paused = true,
            start: () => timerEvent.paused = false,
            reset: (newSeconds) => {
                timeLeft = newSeconds;
                timerText.setText(this.#formatTime(timeLeft));
            },
            getRemaining: () => timeLeft,
            destroy: () => { timerBg.destroy(); timerText.destroy(); timerEvent.destroy(); }
        };
    }

    static createResultCommonUI(scene) {

        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;

        const descriptionPages = [
            { content: 'finishpage_information1' },
            { content: 'finishpage_information2' }
        ];

        scene.add.image(centerX, centerY, 'finishpage_bg');

        // Panels
        const settingPanel = new SettingPanel(scene, 960, 540).setScrollFactor(0);
        settingPanel.setVisible(false);
        settingPanel.setDepth(999); // Setting panel above others by default
        scene.add.existing(settingPanel);

        const descriptionPanel = new CustomPanel(scene, 960, 540, descriptionPages).setScrollFactor(0);

        // Hide navigation buttons and override refresh to keep them hidden
        descriptionPanel.prevBtn.setVisible(false).setActive(false);
        descriptionPanel.nextBtn.setVisible(false).setActive(false);
        const originalRefresh = descriptionPanel.refresh.bind(descriptionPanel);
        descriptionPanel.refresh = () => {
            originalRefresh();
            descriptionPanel.prevBtn.setVisible(false);
            descriptionPanel.nextBtn.setVisible(false);
        };

        descriptionPanel.setVisible(false);
        descriptionPanel.setDepth(999);
        scene.add.existing(descriptionPanel);

        // Auto-switch pages
        scene.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                if (descriptionPanel.visible && descriptionPanel.pages.length > 1) {
                    descriptionPanel.currentPage++;
                    if (descriptionPanel.currentPage >= descriptionPanel.pages.length) {
                        descriptionPanel.currentPage = 0;
                    }
                    descriptionPanel.refresh();
                }
            }
        });

        const itemPanel = new ItemsPanel(scene, 960, 540).setScrollFactor(0);
        itemPanel.setVisible(false);
        itemPanel.setDepth(999);
        scene.add.existing(itemPanel);

        const allButtons = [];

        // Buttons
        const settingBtn = new CustomButton(scene, 100, 100, 'setting_btn', 'setting_btn_click',
            () => {
                openPanel(settingPanel, settingBtn);
            }, () => {
                settingPanel.setVisible(false);
            }).setScrollFactor(0);

        settingBtn.setDepth(999); // Buttons above panels
        allButtons.push(settingBtn);

        const descBtn = new CustomButton(scene, 250, 100, 'desc_button', 'desc_button_click',
            () => {
                openPanel(descriptionPanel, descBtn);
            }, () => {
                descriptionPanel.setVisible(false);
            }).setScrollFactor(0);

        descBtn.setDepth(999);
        allButtons.push(descBtn);

        const itemBtn = new CustomButton(scene, 400, 100, 'gameintro_bag', 'gameintro_bag_click',
            () => {
                openPanel(itemPanel, itemBtn);
            }, () => {
                itemPanel.setVisible(false);
            }).setScrollFactor(0);
        itemBtn.setDepth(999);
        allButtons.push(itemBtn);

        settingBtn.needClicked = true;
        descBtn.needClicked = true;
        itemBtn.needClicked = true;


        descriptionPanel.toggleBtn = descBtn;
        itemBtn.toggleBtn = itemBtn;
        settingPanel.toggleBtn = settingBtn;


        function openPanel(targetPanel, activeBtn) {
            [settingPanel, descriptionPanel, itemPanel]
                .forEach(p => {
                    if (p) p.setVisible(false);
                });
            // --- 重設所有按鈕狀態 ---
            allButtons.forEach(btn => {
                if (btn !== activeBtn) {
                    btn.resetStatus?.();
                }
                btn.setScrollFactor(0);
            });
            if (targetPanel) {
                targetPanel.setVisible(true);
                targetPanel.currentPage = 0;
                if (targetPanel.refresh) targetPanel.refresh();
            }
        }

        return { settingBtn, descBtn, itemBtn, settingPanel, descriptionPanel, itemPanel };
    }


    static #formatTime(s) {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}