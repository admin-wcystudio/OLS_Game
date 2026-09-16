export default class VoiceOverHelper {
    static FADE_MS = 200;
    static BGM_VOLUME = 0.5;
    static BGM_DUCKED_VOLUME = 0.12;
    static bgmAllowed = false;

    // Texture key -> VO file base (matches assets/VO and the VO script)
    static BUBBLE_VO = {
        game1_npc_box_mainstreet: 'game1_npc_box1',
        game1_npc_box_intro: 'game1_npc_box2',
        game1_npc_box_win: 'game1_npc_box3',
        game1_npc_box_tryagain: 'game1_npc_box4',

        game2_npc_box_mainstreet: 'game2_npc_box1',
        game2_npc_box_intro: 'game2_npc_box2',
        game2_npc_box_win: 'game2_npc_box3',
        game2_npc_box_tryagain: 'game2_npc_box4',

        game3_npc_box_mainstreet: 'game3_npc_box1',
        game3_npc_box_win: 'game3_npc_box2',
        game3_npc_box_tryagain: 'game3_npc_box3',

        game4_npc_box_mainstreet: 'game4_npc_box1',
        game4_npc_box_win: 'game4_npc_box2',
        game4_npc_box_tryagain: 'game4_npc_box3',

        game5_npc_box_mainstreet: 'game5_npc_box1',
        game5_npc_box_win: 'game5_npc_box2',
        game5_npc_box_tryagain: 'game5_npc_box3',

        game6_npc_box_mainstreet: 'game6_npc_box1',
        game6_npc_box_win: 'game6_npc_box2',
        game6_npc_box_tryagain: 'game6_npc_box3',

        game7_npc_box_mainstreet_no1: 'game7_npc_box1',
        game7_npc_box_mainstreet_no2: 'game7_npc_box2',
        game7_npc_box_mainstreet: 'game7_npc_box3',
        game7_npc_box_win: 'game7_npc_box4',
        game7_npc_box_win1: 'game7_npc_box5',
        game7_npc_box_win2: 'game7_npc_box6',
        game7_npc_box_tryagain: 'game7_npc_box7'
    };

    static STEMS = [
        'Game_1/game1_npc_box1',
        'Game_1/game1_npc_box2',
        'Game_1/game1_npc_box3',
        'Game_1/game1_npc_box4',
        'Game_2/game2_npc_box1',
        'Game_2/game2_npc_box2',
        'Game_2/game2_npc_box3',
        'Game_2/game2_npc_box4',
        'Game_3/game3_npc_box1',
        'Game_3/game3_npc_box2',
        'Game_3/game3_npc_box3',
        'Game_4/game4_npc_box1',
        'Game_4/game4_npc_box2',
        'Game_4/game4_npc_box3',
        'Game_5/game5_npc_box1',
        'Game_5/game5_npc_box2',
        'Game_5/game5_npc_box3',
        'Game_6/game6_npc_box1',
        'Game_6/game6_npc_box2',
        'Game_6/game6_npc_box3',
        'Game_7/game7_npc_box1',
        'Game_7/game7_npc_box2',
        'Game_7/game7_npc_box3',
        'Game_7/game7_npc_box4',
        'Game_7/game7_npc_box5_boy',
        'Game_7/game7_npc_box5_girl',
        'Game_7/game7_npc_box6_boy',
        'Game_7/game7_npc_box6_girl',
        'Game_7/game7_npc_box7'
    ];

    static preload(scene) {
        VoiceOverHelper.STEMS.forEach((stem) => {
            const fileBase = stem.split('/')[1];
            ['Mandarin', 'Cantonese'].forEach((lang) => {
                const key = `${fileBase}_${lang}`;
                if (!scene.cache.audio.exists(key)) {
                    scene.load.audio(key, `assets/VO/${stem}_${lang}.mp3`);
                }
            });
        });
    }

    static getLanguageSuffix() {
        let language = 'HK';
        try {
            const saved = localStorage.getItem('gameSettings');
            if (saved) {
                language = JSON.parse(saved).language || 'HK';
            }
        } catch (e) {
            language = 'HK';
        }
        return language === 'CN' ? 'Mandarin' : 'Cantonese';
    }

    static getGenderTag() {
        try {
            const player = JSON.parse(localStorage.getItem('player') || '{}');
            return player.gender === 'F' ? 'girl' : 'boy';
        } catch (e) {
            return 'boy';
        }
    }

    static boxBaseFromBubbleKey(bubbleKey) {
        if (!bubbleKey) return null;
        if (VoiceOverHelper.BUBBLE_VO[bubbleKey]) {
            return VoiceOverHelper.BUBBLE_VO[bubbleKey];
        }

        const genderedBox = /^(game\d+_npc_box\d+)_(?:boy|girl)$/.exec(bubbleKey);
        if (genderedBox) return genderedBox[1];
        if (/^game\d+_npc_box\d+$/.test(bubbleKey)) return bubbleKey;
        return null;
    }

    static resolveKey(scene, boxBase, isPlayer) {
        if (!boxBase) return null;
        const lang = VoiceOverHelper.getLanguageSuffix();
        const genderTag = VoiceOverHelper.getGenderTag();
        const gendered = `${boxBase}_${genderTag}_${lang}`;
        const plain = `${boxBase}_${lang}`;

        if (isPlayer) {
            if (scene.cache.audio.exists(gendered)) return gendered;
            if (scene.cache.audio.exists(plain)) return plain;
        } else {
            if (scene.cache.audio.exists(plain)) return plain;
            if (scene.cache.audio.exists(gendered)) return gendered;
        }
        return null;
    }

    static getBgm(scene) {
        return scene.sound.get('bgm');
    }

    static ensureBgm(scene) {
        if (!scene.cache.audio.exists('bgm')) return;
        VoiceOverHelper.bgmAllowed = true;

        const start = () => {
            if (!VoiceOverHelper.bgmAllowed) return;
            let bgm = scene.sound.get('bgm');
            if (!bgm) {
                bgm = scene.sound.add('bgm');
            }
            bgm.setLoop(true);
            bgm.setVolume(VoiceOverHelper.BGM_VOLUME);
            if (!bgm.isPlaying) {
                bgm.play({ loop: true, volume: VoiceOverHelper.BGM_VOLUME });
            }
        };

        start();
        scene.sound.once('unlocked', start);
    }

    static stopBgm(scene) {
        VoiceOverHelper.bgmAllowed = false;
        if (scene.currentBgmTween) {
            scene.currentBgmTween.stop();
            scene.currentBgmTween = null;
        }
        const sounds = typeof scene.sound.getAll === 'function'
            ? scene.sound.getAll('bgm')
            : [];
        const single = VoiceOverHelper.getBgm(scene);
        const list = sounds.length ? sounds : (single ? [single] : []);
        list.forEach((bgm) => {
            bgm.setVolume(0);
            bgm.stop();
            bgm.destroy();
        });
        if (typeof scene.sound.removeByKey === 'function') {
            scene.sound.removeByKey('bgm');
        }
    }

    static fadeBgm(scene, volume) {
        if (!VoiceOverHelper.bgmAllowed && volume > 0) return;
        const bgm = VoiceOverHelper.getBgm(scene);
        if (!bgm) return;
        if (scene.currentBgmTween) {
            scene.currentBgmTween.stop();
            scene.currentBgmTween = null;
        }
        scene.currentBgmTween = scene.tweens.add({
            targets: bgm,
            volume,
            duration: VoiceOverHelper.FADE_MS
        });
    }

    static duckBgm(scene) {
        VoiceOverHelper.fadeBgm(scene, VoiceOverHelper.BGM_DUCKED_VOLUME);
    }

    static restoreBgm(scene) {
        if (!VoiceOverHelper.bgmAllowed) return;
        VoiceOverHelper.fadeBgm(scene, VoiceOverHelper.BGM_VOLUME);
    }

    static stop(scene, options = {}) {
        const restoreBgm = options.restoreBgm !== false;
        if (scene.currentVoTween) {
            scene.currentVoTween.stop();
            scene.currentVoTween = null;
        }
        if (scene.currentVo) {
            scene.currentVo.stop();
            scene.currentVo.destroy();
            scene.currentVo = null;
        }
        if (restoreBgm) VoiceOverHelper.restoreBgm(scene);
    }

    static playBubbleVo(scene, bubbleKey, isPlayer = null) {
        VoiceOverHelper.stop(scene, { restoreBgm: false });
        const boxBase = VoiceOverHelper.boxBaseFromBubbleKey(bubbleKey);
        if (!boxBase) {
            VoiceOverHelper.restoreBgm(scene);
            return;
        }

        const lang = VoiceOverHelper.getLanguageSuffix();
        const genderTag = VoiceOverHelper.getGenderTag();
        const gendered = `${boxBase}_${genderTag}_${lang}`;
        if (isPlayer === null) {
            isPlayer = scene.cache.audio.exists(gendered);
        }

        const voKey = VoiceOverHelper.resolveKey(scene, boxBase, isPlayer);
        if (!voKey) {
            VoiceOverHelper.restoreBgm(scene);
            return;
        }

        const sound = scene.sound.add(voKey);
        sound.setVolume(0);
        sound.play();
        scene.currentVo = sound;
        VoiceOverHelper.duckBgm(scene);
        scene.currentVoTween = scene.tweens.add({
            targets: sound,
            volume: 1,
            duration: VoiceOverHelper.FADE_MS
        });
        sound.once('complete', () => {
            if (scene.currentVo === sound) {
                scene.currentVo = null;
                VoiceOverHelper.restoreBgm(scene);
            }
        });
    }
}
