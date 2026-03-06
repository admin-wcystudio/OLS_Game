
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
        this.load.video('boy_bg1', path + 'game5_boy_bg1.webm');
        this.load.video('boy_bg2', path + 'game5_boy_bg2.webm');
        this.load.video('girl_bg1', path + 'game5_girl_bg1.webm');
        this.load.video('girl_bg2', path + 'game5_girl_bg2.webm');

        // NPC dialogue boxes (in ascending order)
        this.load.image('game5_npc_box1', `${path}game5_npc_box1.png`);
        this.load.image('game5_npc_box3', `${path}game5_npc_box4.png`);
        this.load.image('game5_npc_box4', `${path}game5_npc_box6.png`);
        this.load.image('game5_npc_box5', `${path}game5_npc_box8.png`);

        this.load.image('game5_npc_box_win', `${path}game5_npc_box10.png`);
        this.load.image('game5_npc_box_tryagain', `${path}game5_npc_box11.png`);
        this.load.image('game5_npc_box_intro', `${path}game5_npc_box3.png`);

        this.load.image('game5_boy_npc_box1', `${path}game5_npc_boy_box4.png`);
        this.load.image('game5_boy_npc_box2', `${path}game5_npc_boy_box5.png`);
        this.load.image('game5_boy_npc_box3', `${path}game5_npc_boy_box7.png`);
        this.load.image('game5_boy_npc_box4', `${path}game5_npc_boy_box9.png`);

        this.load.image('game5_girl_npc_box1', `${path}game5_npc_girl_box2.png`);
        this.load.image('game5_girl_npc_box2', `${path}game5_npc_girl_box5.png`);
        this.load.image('game5_girl_npc_box3', `${path}game5_npc_girl_box7.png`);
        this.load.image('game5_girl_npc_box4', `${path}game5_npc_girl_box9.png`);


        // UI buttons
        this.load.image('game5_confirm_button', `${path}game5_confirm_button.png`);
        this.load.image('game5_confirm_button_select', `${path}game5_confirm_button_select.png`);

        for (let i = 1; i <= 3; i++) {
            this.load.image(`game5_q${i}`, `${path}game5_q${i}.png`);
            this.load.image(`game5_q${i}_a_button`, `${path}game5_q${i}_a_button.png`);
            this.load.image(`game5_q${i}_b_button`, `${path}game5_q${i}_b_button.png`);
            this.load.image(`game5_q${i}_c_button`, `${path}game5_q${i}_c_button.png`);
            this.load.image(`game5_q${i}_d_button`, `${path}game5_q${i}_d_button.png`);
            this.load.image(`game5_q${i}_a_button_select`, `${path}game5_q${i}_a_button_select.png`);
            this.load.image(`game5_q${i}_b_button_select`, `${path}game5_q${i}_b_button_select.png`);
            this.load.image(`game5_q${i}_c_button_select`, `${path}game5_q${i}_c_button_select.png`);
            this.load.image(`game5_q${i}_d_button_select`, `${path}game5_q${i}_d_button_select.png`);
        }
    }

    create() {
        const gender = localStorage.getItem('player') ? JSON.parse(localStorage.getItem('player')).gender : 'F';

        this.genderKey = gender === 'M' ? 'boy' : 'girl';
        const genderKey = this.genderKey;


        // Create and play background video based on gender
        this.bgVideo = this.add.video(960, 540, `${this.genderKey}_bg1`)
            .setDepth(-1)
            .setOrigin(0.5, 0.5);

        this.bgVideo.play(true); // true = loop the video

        // Pass null for bgKey since using video background
        this.initGame(null, 'game5_description', false, false, {
            targetRounds: 3,
            roundPerSeconds: 60,
            isAllowRoundFail: false,
            isContinuousTimer: true,
            sceneIndex: 5
        });
    }

    setupGameObjects() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
            this.questionPanel = null;
        }

        const allQuestions = [
            {
                content: 'game5_q1',
                options: ['game5_q1_a_button', 'game5_q1_b_button', 'game5_q1_c_button', 'game5_q1_d_button'],
                answer: 0,
                nextDialog: 'game5_npc_box3',
                characterDialog: `game5_${this.genderKey}_npc_box2`
            },
            {
                content: 'game5_q2',
                options: ['game5_q2_a_button', 'game5_q2_b_button', 'game5_q2_c_button', 'game5_q2_d_button'],
                answer: 3,
                nextDialog: 'game5_npc_box4',
                characterDialog: `game5_${this.genderKey}_npc_box3`
            },
            {
                content: 'game5_q3',
                options: ['game5_q3_a_button', 'game5_q3_b_button', 'game5_q3_c_button', 'game5_q3_d_button'],
                answer: 1,
                nextDialog: 'game5_npc_box5',
                characterDialog: `game5_${this.genderKey}_npc_box4`
            }
        ]

        this.questionPanel = new QuestionPanel(this, allQuestions, () => {
        });
        this.questionPanel.setDepth(559).setVisible(false);
    }

    enableGameInteraction(enable) {
        if (this.questionPanel) {
            this.questionPanel.setVisible(enable);
        }
    }

    resetForNewRound() {
        if (this.questionPanel) {
            this.questionPanel.destroy();
        }

        this.bgVideo.destroy();
        this.bgVideo = this.add.video(960, 540, `${this.genderKey}_bg1`)
            .setDepth(-1)
            .setOrigin(0.5, 0.5);
        this.bgVideo.play(true);

        this.setupGameObjects(); // 重新抽題並建立 Panel
        this.questionPanel.setVisible(true);
    }

    showWin() {
        this.questionPanel.setVisible(false);
        this.time.delayedCall(1500, () => {
            GameManager.backToMainStreet(this);
        });
    }

    showLose(onComplete) {
        // Stop and destroy the current video
        if (this.bgVideo) {
            this.bgVideo.stop();
            this.bgVideo.destroy();
        }

        // Play the fail background video
        this.bgVideo = this.add.video(960, 540, `${this.genderKey}_bg2`)
            .setDepth(-1)
            .setOrigin(0.5, 0.5);
        this.bgVideo.play(true);

        // Delay before showing fail panel to let the video play
        this.time.delayedCall(3000, () => {
            if (onComplete) onComplete();
        });
    }

}
