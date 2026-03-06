import { CustomButton } from '../UI/Button.js';
import { CustomPanel, SettingPanel } from '../UI/Panel.js';
import UIHelper from '../UI/UIHelper.js';

export class GameStartScene extends Phaser.Scene {
    constructor() {
        super('GameStartScene');
    }

    create() {
        // Reset player progress but keep settings
        localStorage.removeItem('player');
        localStorage.removeItem('allGamesResult');
        localStorage.removeItem('playerPosition');
        localStorage.removeItem('hasSeenMainStreetIntro');

        this.bgVideo = this.add.video(960, 540, 'cover_video');
        this.bgVideo.setMute(false);
        this.bgVideo.play(true); // loop

        if (this.sound.getAll('bgm').length === 0) {
            this.sound.play('bgm', { loop: true, volume: 0.5 });
        }

        const descriptionPages = [
            {
                content: 'game_description_p1',
                nextBtn: 'next_button', nextBtnClick: 'next_button_click',
                prevBtn: null, prevBtnClick: null,
                closeBtn: 'close_button', closeBtnClick: 'close_button_click'
            },
            {
                content: 'game_description_p2',
                nextBtn: 'next_button', nextBtnClick: 'next_button_click',
                prevBtn: 'prev_button', prevBtnClick: 'prev_button',
                closeBtn: 'close_button', closeBtnClick: 'close_button_click'
            }
        ];

        const programPages = [
            {
                content: 'program_information_p1',
                nextBtn: 'next_button', nextBtnClick: 'next_button_click',
                prevBtn: 'prev_button', prevBtnClick: 'prev_button_click',
                closeBtn: 'close_button', closeBtnClick: 'close_button_click'
            },
            {
                content: 'program_information_p2',
                nextBtn: 'next_button', nextBtnClick: 'next_button_click',
                prevBtn: 'prev_button', prevBtnClick: 'prev_button',
                closeBtn: 'close_button', closeBtnClick: 'close_button_click'
            },
            {
                content: 'program_information_p3',
                nextBtn: 'next_button', nextBtnClick: 'next_button_click',
                prevBtn: 'prev_button', prevBtnClick: 'prev_button',
                closeBtn: 'close_button', closeBtnClick: 'close_button_click'
            },
            {
                content: 'program_information_p4',
                nextBtn: 'next_button', nextBtnClick: 'next_button_click',
                prevBtn: 'prev_button', prevBtnClick: 'prev_button',
                closeBtn: 'close_button', closeBtnClick: 'close_button_click'
            }

        ]

        const ui = UIHelper.createCommonUI(this, programPages, descriptionPages, 100);

        const descriptionPanel = new CustomPanel(this, 960, 540, descriptionPages);
        descriptionPanel.setVisible(false);
        descriptionPanel.setDepth(200);


        const gameDescrBtn = new CustomButton(this, 960, 800, 'cover_game_description_button', 'cover_game_description_button_click', () => {
            descriptionPanel.show();
            descriptionPanel.currentPage = 0;
            descriptionPanel.refresh();
        });
        gameDescrBtn.needClicked = false;


        const startBtn = new CustomButton(this, 960, 900, 'cover_game_start', 'cover_game_start_click', () => {
            console.log("go to login");
            this.scene.start('LoginScene');
        });


    }
}