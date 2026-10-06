import { CustomButton } from '../UI/Button.js';
import UIHelper from '../UI/UIHelper.js';
import { CustomPanel, SettingPanel } from '../UI/Panel.js';
import NpcHelper from '../Character/NpcHelper.js';
import VoiceOverHelper from '../Audio/VoiceOverHelper.js';

export default class GameManager {
    static SESSION_START_KEY = 'sessionStart_OLS';

    static startSessionClock() {
        if (!localStorage.getItem(GameManager.SESSION_START_KEY)) {
            localStorage.setItem(GameManager.SESSION_START_KEY, String(Date.now()));
        }
    }

    static clearSessionClock() {
        localStorage.removeItem(GameManager.SESSION_START_KEY);
    }

    static getSessionSeconds() {
        const start = Number(localStorage.getItem(GameManager.SESSION_START_KEY));
        if (!start) return null;
        return Math.max(0, Math.floor((Date.now() - start) / 1000));
    }

    static saveGameResult(sceneIndex, isCompleted, seconds = 0) {
        const savedGameResultData = localStorage.getItem('allGamesResult');
        let allGamesResult = savedGameResultData ? JSON.parse(savedGameResultData) : [
            { game: 1, isFinished: false, seconds: 0 },
            { game: 2, isFinished: false, seconds: 0 },
            { game: 3, isFinished: false, seconds: 0 },
            { game: 4, isFinished: false, seconds: 0 },
            { game: 5, isFinished: false, seconds: 0 },
            { game: 6, isFinished: false, seconds: 0 },
            { game: 7, isFinished: false, seconds: 0 },
        ];

        const gameResult = allGamesResult.find(g => g.game === sceneIndex);
        if (gameResult) {
            gameResult.isFinished = isCompleted;
            gameResult.seconds = seconds;
        }
        console.log("儲存遊戲結果:", allGamesResult);
        localStorage.setItem('allGamesResult', JSON.stringify(allGamesResult));

    }

    static loadGameResult() {
        const savedGameResultData = localStorage.getItem('allGamesResult');
        let allGamesResult = savedGameResultData ? JSON.parse(savedGameResultData) : [
            { game: 1, isFinished: false, seconds: 0 },
            { game: 2, isFinished: false, seconds: 0 },
            { game: 3, isFinished: false, seconds: 0 },
            { game: 4, isFinished: false, seconds: 0 },
            { game: 5, isFinished: false, seconds: 0 },
            { game: 6, isFinished: false, seconds: 0 },
            { game: 7, isFinished: false, seconds: 0 },
        ];
        return allGamesResult;
    }

    static loadOneGameResult(sceneIndex) {
        console.log("載入遊戲結果 for game", sceneIndex);
        const allGamesResult = this.loadGameResult();
        return allGamesResult.find(g => g.game === sceneIndex);
    }

    static backToMainStreet(scene) {
        VoiceOverHelper.stop(scene, { restoreBgm: false });
        scene.cameras.main.fadeOut(500, 0, 0, 0);

        scene.cameras.main.once('camerafadeoutcomplete', () => {
            scene.scene.start('MainStreetScene');
        });
    }

    static switchToGameScene(scene, gameSceneKey) {
        if (gameSceneKey === 'GameStartScene') {
            VoiceOverHelper.stop(scene, { restoreBgm: false });
            VoiceOverHelper.stopBgm(scene);
        } else {
            VoiceOverHelper.stop(scene);
        }
        scene.cameras.main.fadeOut(500, 0, 0, 0);
        scene.cameras.main.once('camerafadeoutcomplete', () => {
            scene.scene.start(gameSceneKey);
        });
    }

}