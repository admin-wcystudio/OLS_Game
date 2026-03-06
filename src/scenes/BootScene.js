export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.plugin('rexinputtextplugin', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.80.17/dist/rexinputtextplugin.min.js', true);

        this.load.audio('bgm', 'assets/music/bgm.mp3');
        // Load assets for the boot scene
        const gameStartPath = 'assets/images/GameStart/';

        this.load.video('cover_video', gameStartPath + 'cover_bg.webm');
        this.load.image('close_button', gameStartPath + 'close_button.png');
        this.load.image('close_button_click', gameStartPath + 'close_button_click.png');
        // Video/webm not supported by this.load.image
        this.load.image('cover_game_description_button', gameStartPath + 'cover_game_description_button.png');
        this.load.image('cover_game_description_button_click', gameStartPath + 'cover_game_description_button_click.png');
        this.load.image('cover_game_start', gameStartPath + 'cover_game_start.png');
        this.load.image('cover_game_start_click', gameStartPath + 'cover_game_start_click.png');
        this.load.image('desc_button', gameStartPath + 'game_description_button.png');
        this.load.image('desc_button_click', gameStartPath + 'game_description_button_click.png');
        this.load.image('prev_button', gameStartPath + 'left_arrow_button.png');
        this.load.image('prev_button_click', gameStartPath + 'left_arrow_button_click.png');
        this.load.image('program_btn', gameStartPath + 'program_information_button.png');
        this.load.image('program_btn_click', gameStartPath + 'program_information_button_click.png');
        this.load.image('program_information_p1', gameStartPath + 'program_information_p1.png');
        this.load.image('program_information_p2', gameStartPath + 'program_information_p2.png');
        this.load.image('program_information_p3', gameStartPath + 'program_information_p3.png');
        this.load.image('program_information_p4', gameStartPath + 'program_information_p4.png');
        this.load.image('game_description_p1', gameStartPath + 'game_description_p1.png');
        this.load.image('game_description_p2', gameStartPath + 'game_description_p2.png');
        this.load.image('next_button', gameStartPath + 'right_arrow_button.png');
        this.load.image('next_button_click', gameStartPath + 'right_arrow_button_click.png');
        this.load.image('setting_btn', gameStartPath + 'setting_button.png');
        this.load.image('setting_btn_click', gameStartPath + 'setting_button_click.png');

        //settings page
        this.load.image('setting_bg', 'assets/images/Settings/setting_page_bg.png');

        this.load.image('vol_bg', 'assets/images/Settings/setting_page_volume_bg.png');
        this.load.image('vol_1', 'assets/images/Settings/setting_page_volume1.png');
        this.load.image('vol_2', 'assets/images/Settings/setting_page_volume2.png');
        this.load.image('vol_3', 'assets/images/Settings/setting_page_volume3.png');
        this.load.image('vol_4', 'assets/images/Settings/setting_page_volume4.png');
        this.load.image('vol_5', 'assets/images/Settings/setting_page_volume5.png');

        this.load.image('vol_left', 'assets/images/Settings/setting_page_left_arrow.png');
        this.load.image('vol_left_click', 'assets/images/Settings/setting_page_left_arrow_click.png');
        this.load.image('vol_right', 'assets/images/Settings/setting_page_right_arrow.png');
        this.load.image('vol_right_click', 'assets/images/Settings/setting_page_right_arrow_click.png');

        this.load.image('lang_mandarin', 'assets/images/Settings/setting_page_mandarin.png');
        this.load.image('lang_mandarin_click', 'assets/images/Settings/setting_page_mandarin_click.png');
        this.load.image('lang_cantonese', 'assets/images/Settings/setting_page_cantonese.png');
        this.load.image('lang_cantonese_click', 'assets/images/Settings/setting_page_cantonese_click.png');

        this.load.image('save_btn', 'assets/images/Settings/setting_page_save.png');
        this.load.image('save_btn_click', 'assets/images/Settings/setting_page_save_click.png');

        //items page
        const itemsPath = 'assets/images/Items/';

        // dynamically load all known item assets
        const itemKeys = [
            'itempage_item1',
            'itempage_item1_select',
            'game1_object_description',
            'itempage_item2_select',
            'itempage_item2',
            'game2_object_description',
            'itempage_item3',
            'itempage_item3_select',
            'game3_object_description',
            'itempage_item4',
            'itempage_item4_select',
            'game4_object_description',
            'itempage_item_box',
            'itempage_bg',
            'itempage_panel_bg',
            'itempage_close_button',
            'itempage_close_button_select'
        ];
        itemKeys.forEach(key => {
            this.load.image(key, `${itemsPath}${key}.png`);
        });


        // general assets
        this.load.image('gameintro_bag', 'assets/images/MainStreet/gameintro_bag.png');
        this.load.image('gameintro_bag_click', 'assets/images/MainStreet/gameintro_bag_click.png');
        this.load.image('gameintro_closebutton', 'assets/images/MainStreet/gameintro_closebutton.png');
        this.load.image('gameintro_closebutton_click', 'assets/images/MainStreet/gameintro_closebutton_click.png');


        const asset_path = 'assets/images/Game_1/';
        this.load.image('again_btn', asset_path + 'again_button.png');
        this.load.image('again_btn_click', asset_path + 'again_button_mouseover.png');
        this.load.image('leave_btn', asset_path + 'leave_button.png');
        this.load.image('leave_btn_click', asset_path + 'leave_button_mouseover.png');

        this.load.image('close_btn', asset_path + 'game1_closebutton.png');
        this.load.image('close_btn_click', asset_path + 'game1_closebutton_select.png');
        this.load.image('fail_chance', asset_path + 'game1_fail.png');
        this.load.image('success_chance', asset_path + 'game1_success.png');
        this.load.image('game_gamechance', asset_path + 'game1_gamechance.png');
        this.load.image('game_fail_label', asset_path + 'game1_fail_icon.png');
        this.load.image('game_success_label', asset_path + 'game1_success_icon.png');
        this.load.image('game_timer_bg', asset_path + 'game1_timer.png');
        this.load.image('popup_bg', asset_path + 'popup_bg.png');

        //game 1 asset
        for (let i = 1; i <= 4; i++) {
            this.load.image(`game1_failobject${i}`, `assets/images/Game_1/game1_failobject${i}.png`);
        }
        this.load.image('game1_successobject', 'assets/images/Game_1/game1_successobject.png');
        this.load.image('left_btn', asset_path + 'game1_left_button.png');
        this.load.image('left_btn_click', asset_path + 'game1_left_button_click.png');
        this.load.image('right_btn', asset_path + 'game1_right_button.png');
        this.load.image('right_btn_click', asset_path + 'game1_right_button_click.png');
        this.load.image('game1_object_description', asset_path + 'game1_object_description.png');

        // load game bg
        for (let i = 1; i <= 7; i++) {
            this.load.image(`game${i}_description`, `assets/images/Game_${i}/game${i}_description.png`);
            if (i === 5) continue; // skip game 5 bg as it is not used
            this.load.image(`game${i}_bg`, `assets/images/Game_${i}/game${i}_bg.png`);

        }


    }

    create() {
        console.log('Global Assets Loaded');

        const savedData = localStorage.getItem('gameSettings');

        if (savedData) {
            const settings = JSON.parse(savedData);

            this.sound.volume = settings.volume * 0.2;

            this.registry.set('globalSettings', settings);
        }
        this.scene.start('GameStartScene');
    }
}

