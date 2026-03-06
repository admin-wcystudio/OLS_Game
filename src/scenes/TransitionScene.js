export class TransitionScene extends Phaser.Scene {
    constructor() {
        super('TransitionScene');
    }

    create() {

        this.bgVideo = this.add.video(960, 540, 'transition').setDepth(12).setVisible(true);
        this.bgVideo.setMute(false);
        this.bgVideo.play(true);

        this.time.delayedCall(1000, () => {
            console.log('TransitionScene: Transition complete, starting MainStreetScene');
            this.scene.start('MainStreetScene');
        });

    }
}