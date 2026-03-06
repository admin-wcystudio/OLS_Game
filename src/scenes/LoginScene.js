import { CustomButton } from '../UI/Button.js';
import { CustomPanel, SettingPanel } from '../UI/Panel.js';
import UIHelper from '../UI/UIHelper.js';

export class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    preload() {

        const loginPath = 'assets/images/Login/';
        this.load.video('login_bg_video', loginPath + 'choosepage_bg.mp4');

        this.load.image('login_boy_btn', loginPath + 'choosepage_boy_button.png');
        this.load.image('login_boy_btn_click', loginPath + 'choosepage_boy_button_click.png');

        this.load.image('login_girl_btn', loginPath + 'choosepage_girl_button.png');
        this.load.image('login_girl_btn_click', loginPath + 'choosepage_girl_button_click.png');

        this.load.image('login_namebar', loginPath + 'choosepage_namebar.png');
        this.load.image('bubble1', loginPath + 'choosepage_bubble1.png');
        this.load.image('bubble2', loginPath + 'choosepage_bubble2.png');

        this.load.spritesheet('boy_galaxy', loginPath + 'choosepage_boy_galaxy.png',
            { frameWidth: 350, frameHeight: 450 });

        this.load.spritesheet('boy_chinese', loginPath + 'choosepage_boy_chinese.png',
            { frameWidth: 350, frameHeight: 450 });

        this.load.spritesheet('boy_transition', loginPath + 'choosepage_boy_galaxytochinese_transition.png',
            { frameWidth: 350, frameHeight: 450 });

        this.load.spritesheet('girl_galaxy', loginPath + 'choosepage_girl_galaxy.png',
            { frameWidth: 350, frameHeight: 450 });

        this.load.spritesheet('girl_chinese', loginPath + 'choosepage_girl_chinese.png',
            { frameWidth: 350, frameHeight: 450 });
        this.load.spritesheet('girl_transition', loginPath + 'choosepage_girl_galaxytochinese_transition.png',
            { frameWidth: 350, frameHeight: 450 });

        this.load.video('transition', loginPath + 'Transition.webm');
    }

    create() {
        this.bgVideo = this.add.video(960, 540, 'login_bg_video');
        this.bgVideo.getFirstFrame();

        this.createAnimations();

        this.bgVideo.setMute(false);

        this.bgVideo.play(true); // loop

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

        const ui = UIHelper.createCommonUI(this, programPages, descriptionPages,);

        this.add.image(960, 150, 'login_namebar').setDepth(10);

        const width = 350;
        const height = 50;


        this.nameInput = this.add.rexInputText(1080, 200, width, height, {
            type: 'text',
            placeholder: '_',
            fontSize: '48px',
            color: '#fbb03b',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'transparent'
        }).setDepth(20).setVisible(true);

        this.nameInput.on('textchange', (inputText) => {
            console.log("現在的名字是:", inputText.text);
        });

        this.selectedGender = 'M';

        // 1. Add the sprite (using the first spritesheet as initial texture)
        this.boySprite = this.add.sprite(620, 540, 'boy_galaxy')
            .setDepth(10)
            .setScrollFactor(0).setScale(2);

        this.boySprite.play('boy_galaxy_anim');

        this.girlSprite = this.add.sprite(1300, 560, 'girl_galaxy')
            .setDepth(10)
            .setScrollFactor(0).setScale(2);

        this.girlSprite.play('girl_galaxy_anim');


        this.add.image(340, 350, 'bubble1').setDepth(11);
        this.add.image(1650, 360, 'bubble2').setDepth(11);

        const boyBtn = new CustomButton(
            this, 620, 950,
            'login_boy_btn', 'login_boy_btn_click',
            () => {
                this.savePlayerInfo('M');

            }, () => { });

        const girlBtn = new CustomButton(
            this, 1300, 950,
            'login_girl_btn', 'login_girl_btn_click',
            () => {
                this.savePlayerInfo('F');
            }, () => { });

    }

    savePlayerInfo(gender, currentSprite) {
        const playerName = this.nameInput.text;

        if (!playerName || playerName.trim() === "") {
            UIHelper.showToast(this, "請先輸入名字"); // 使用 Helper 提示
            return;
        }

        this.selectedGender = gender;
        this.switchAnimation();

        // 儲存資料
        const player = { name: playerName, gender: gender };
        localStorage.setItem('player', JSON.stringify(player));

        const allGamesResult = [
            { game: 1, isFinished: false, seconds: 0 },
            { game: 2, isFinished: false, seconds: 0 },
            { game: 3, isFinished: false, seconds: 0 },
            { game: 4, isFinished: false, seconds: 0 },
            { game: 5, isFinished: false, seconds: 0 },
            { game: 6, isFinished: false, seconds: 0 },
            { game: 7, isFinished: false, seconds: 0 },
        ];
        localStorage.setItem('allGamesResult', JSON.stringify(allGamesResult));

        this.switchToTransitionScene();
    }

    switchAnimation() {
        if (this.selectedGender === 'M') {
            this.girlSprite.play('girl_galaxy_anim');
            this.boySprite.play('boy_transition_anim');
            this.boySprite.on('animationcomplete', () => {
                this.time.delayedCall(1000, () => {
                    this.boySprite.play('boy_chinese_anim');
                });
            });

        } else {
            this.boySprite.play('boy_galaxy_anim');
            this.girlSprite.play('girl_transition_anim');
            this.girlSprite.on('animationcomplete', () => {
                this.time.delayedCall(1000, () => {
                    this.girlSprite.play('girl_chinese_anim');
                });
            });
        }
    }

    switchToTransitionScene() {
        this.time.delayedCall(4000, () => {
            this.scene.start('TransitionScene');
        });
    }

    createAnimations() {
        this.anims.create({
            key: 'boy_galaxy_anim',  // Name you will use in other scenes
            frames: this.anims.generateFrameNumbers('boy_galaxy', { start: 0, end: 98 }),
            frameRate: 30,
            repeat: -1
        });
        this.anims.create({
            key: 'boy_chinese_anim',  // Name you will use in other scenes
            frames: this.anims.generateFrameNumbers('boy_galaxy', { start: 0, end: 98 }),
            frameRate: 30,
            repeat: -1
        });

        this.anims.create({
            key: 'boy_transition_anim',  // Name you will use in other scenes
            frames: this.anims.generateFrameNumbers('boy_transition', { start: 0, end: 98 }),
            frameRate: 30,
            repeat: 0
        });

        this.anims.create({
            key: 'girl_galaxy_anim',
            frames: this.anims.generateFrameNumbers('girl_galaxy', { start: 0, end: 98 }),
            frameRate: 30,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_chinese_anim',
            frames: this.anims.generateFrameNumbers('girl_chinese', { start: 0, end: 98 }),
            frameRate: 30,
            repeat: -1
        });

        this.anims.create({
            key: 'girl_transition_anim',  // Name you will use in other scenes
            frames: this.anims.generateFrameNumbers('girl_transition', { start: 0, end: 98 }),
            frameRate: 30,
            repeat: 0
        });


    }

}