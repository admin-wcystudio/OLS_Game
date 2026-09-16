import { CustomButton } from '../UI/Button.js';
import { CustomPanel, SettingPanel } from '../UI/Panel.js';
import UIHelper from '../UI/UIHelper.js';
import VoiceOverHelper from '../Audio/VoiceOverHelper.js';

export class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    preload() {

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Loading bar background
        const barBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x222222);
        barBg.setStrokeStyle(2, 0xffffff);

        // Loading bar fill
        const barFill = this.add.rectangle(width / 2 - 195, height / 2, 0, 22, 0x00ff00);
        barFill.setOrigin(0, 0.5);

        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, '載入中...', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Percentage text
        const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Update progress bar on load progress
        this.load.on('progress', (value) => {
            barFill.width = 390 * value;
            percentText.setText(Math.round(value * 100) + '%');
        });

        // Minimum wait time in ms (30 seconds)
        const minWaitTime = 30000;
        const startTime = Date.now();
        let isAssetsLoaded = false;

        const checkLoadingComplete = () => {
            const elapsedTime = Date.now() - startTime;
            if (isAssetsLoaded && elapsedTime >= minWaitTime) {
                barBg.destroy();
                barFill.destroy();
                loadingText.destroy();
                percentText.destroy();
            } else if (isAssetsLoaded) {
                // If assets loaded but time hasn't passed, check again later
                const remainingTime = minWaitTime - elapsedTime;
                this.time.delayedCall(remainingTime, checkLoadingComplete, [], this);
            }
        };

        // Clean up when loading complete
        this.load.on('complete', () => {
            isAssetsLoaded = true;
            checkLoadingComplete();
        });


        //login page
        const loginPath = 'assets/images/Login/';
        this.load.video('login_bg_video', loginPath + 'choosepage_bg.mp4');

        this.load.image('login_boy_btn', loginPath + 'choosepage_boy_button.png');
        this.load.image('login_boy_btn_click', loginPath + 'choosepage_boy_button_click.png');

        this.load.image('login_girl_btn', loginPath + 'choosepage_girl_button.png');
        this.load.image('login_girl_btn_click', loginPath + 'choosepage_girl_button_click.png');

        this.load.image('login_namebar', loginPath + 'choosepage_namebar.png');
        this.load.image('bubble1', loginPath + 'choosepage_bubble1.png');
        this.load.image('bubble2', loginPath + 'choosepage_bubble2.png');

        // frame = png size / (cols x rows)
        this.load.spritesheet('boy_galaxy', loginPath + 'choosepage_boy_galaxy.png',
            { frameWidth: 250, frameHeight: 321 }); // 1000x1285 / 4x4

        this.load.spritesheet('boy_chinese', loginPath + 'choosepage_boy_chinese.png',
            { frameWidth: 250, frameHeight: 321 }); // 1000x1285 / 4x4

        this.load.spritesheet('boy_transition', loginPath + 'choosepage_boy_galaxytochinese_transition.png',
            { frameWidth: 200, frameHeight: 257 }); // 1000x1029 / 5x4

        this.load.spritesheet('girl_galaxy', loginPath + 'choosepage_girl_galaxy.png',
            { frameWidth: 250, frameHeight: 321 }); // 1000x1285 / 4x4

        this.load.spritesheet('girl_chinese', loginPath + 'choosepage_girl_chinese.png',
            { frameWidth: 250, frameHeight: 321 }); // 1000x1286 / 4x4

        this.load.spritesheet('girl_transition', loginPath + 'choosepage_girl_galaxytochinese_transition.png',
            { frameWidth: 200, frameHeight: 257 }); // 1000x1285 / 5x5
    }

    create() {
        this.bgVideo = this.add.video(960, 540, 'login_bg_video');
        this.bgVideo.getFirstFrame();

        this.createAnimations();

        this.bgVideo.setMute(false);

        this.bgVideo.play(true); // loop
        VoiceOverHelper.ensureBgm(this);

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


        this.genderLocked = false;
        this.selectedGender = null;

        this.nameInput = this.add.rexInputText(1080, 190, width, height, {
            type: 'text',
            placeholder: '_',
            fontSize: '48px',
            color: '#fbb03b',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            backgroundColor: 'transparent'
        }).setDepth(20);

        this.nameInput.on('textchange', () => {
            if (this.genderLocked) return;
            this.setGenderButtonsEnabled(this.hasPlayerName());
        });

        // 1. Add the sprite (using the first spritesheet as initial texture)
        this.boySprite = this.add.sprite(620, 540, 'boy_galaxy')
            .setDepth(10)
            .setScrollFactor(0);
        this.playLoginAnim(this.boySprite, 'boy_galaxy_anim');

        this.girlSprite = this.add.sprite(1300, 560, 'girl_galaxy')
            .setDepth(10)
            .setScrollFactor(0);
        this.playLoginAnim(this.girlSprite, 'girl_galaxy_anim');


        this.add.image(340, 350, 'bubble1').setDepth(11);
        this.add.image(1650, 360, 'bubble2').setDepth(11);

        this.boyBtn = new CustomButton(
            this, 620, 950,
            'login_boy_btn', 'login_boy_btn_click',
            () => {
                this.savePlayerInfo('M');
            }, () => { });

        this.girlBtn = new CustomButton(
            this, 1300, 950,
            'login_girl_btn', 'login_girl_btn_click',
            () => {
                this.savePlayerInfo('F');
            }, () => { });

        this.setGenderButtonsEnabled(false);
    }

    hasPlayerName() {
        const playerName = this.nameInput?.text || '';
        return playerName.trim() !== '';
    }

    setGenderButtonsEnabled(enabled) {
        [this.boyBtn, this.girlBtn].forEach((btn) => {
            if (!btn) return;
            btn.setActive(enabled);
            btn.setAlpha(enabled ? 1 : 0.45);
            if (enabled) btn.setNormalState();
        });
    }

    lockNameField() {
        if (this.nameInput.setReadOnly) this.nameInput.setReadOnly(true);
        const node = this.nameInput.node;
        if (node) {
            node.readOnly = true;
            node.blur();
            node.style.pointerEvents = 'none';
        }
        this.nameInput.setAlpha(0.7);
    }

    lockGenderChoice(gender) {
        this.genderLocked = true;
        const chosen = gender === 'M' ? this.boyBtn : this.girlBtn;
        const other = gender === 'M' ? this.girlBtn : this.boyBtn;

        chosen.setLocked(true);
        chosen.isClicked = true;
        chosen.needClicked = true;
        chosen.setPressedState();
        chosen.setAlpha(1);

        other.setLocked(true);
        other.isClicked = false;
        other.setNormalState();
        other.setAlpha(0.45);

        this.lockNameField();
    }

    savePlayerInfo(gender) {
        if (this.genderLocked) return;

        if (!this.hasPlayerName()) {
            UIHelper.showToast(this, "請先輸入名字");
            return;
        }

        this.lockGenderChoice(gender);
        VoiceOverHelper.ensureBgm(this);
        this.selectedGender = gender;
        this.switchAnimation();

        const playerName = this.nameInput.text.trim();
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

    fitLoginSprite(sprite) {
        const frame = sprite.frame;
        if (!frame || !frame.width || !frame.height) return;
        sprite.setScale(700 / frame.width, 900 / frame.height);
    }

    playLoginAnim(sprite, key, onComplete) {
        if (!sprite || !this.anims.exists(key)) return false;
        const anim = this.anims.get(key);
        if (!anim || !anim.frames?.length || !anim.frames[0]?.frame) return false;
        if (onComplete) sprite.once('animationcomplete', onComplete);
        sprite.play(key);
        this.fitLoginSprite(sprite);
        return true;
    }

    switchAnimation() {
        if (this.selectedGender === 'M') {
            this.playLoginAnim(this.girlSprite, 'girl_galaxy_anim');
            this.playLoginAnim(this.boySprite, 'boy_transition_anim', () => {
                this.playLoginAnim(this.boySprite, 'boy_chinese_anim');
            });
        } else {
            this.playLoginAnim(this.boySprite, 'boy_galaxy_anim');
            this.playLoginAnim(this.girlSprite, 'girl_transition_anim', () => {
                this.playLoginAnim(this.girlSprite, 'girl_chinese_anim');
            });
        }
    }

    switchToTransitionScene() {
        this.time.delayedCall(4000, () => {
            this.scene.start('TransitionScene');
        });
    }

    createAnimations() {
        const createSheetAnim = (key, texture, end, frameRate, repeat) => {
            if (this.anims.exists(key) || !this.textures.exists(texture)) return;
            const tex = this.textures.get(texture);
            if (!tex || tex.frameTotal <= 1) return;
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(texture, { start: 0, end }),
                frameRate,
                repeat
            });
        };

        createSheetAnim('boy_galaxy_anim', 'boy_galaxy', 15, 16, -1);
        createSheetAnim('boy_chinese_anim', 'boy_chinese', 15, 16, -1);
        createSheetAnim('boy_transition_anim', 'boy_transition', 19, 16, 0);
        createSheetAnim('girl_galaxy_anim', 'girl_galaxy', 15, 16, -1);
        createSheetAnim('girl_chinese_anim', 'girl_chinese', 15, 16, -1);
        createSheetAnim('girl_transition_anim', 'girl_transition', 24, 16, 0);

        // NPC Animations are now created in MainStreetScene
    }

}