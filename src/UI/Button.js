/**
 * BASE BUTTON CLASS
 * Handles interaction logic, state switching, and animations.
 */
class BaseButton extends Phaser.GameObjects.Image {
    constructor(scene, x, y, normalKey, pressedKey, callbackDown, callbackUp) {
        super(scene, x, y, normalKey);

        this.normalKey = normalKey;
        this.pressedKey = pressedKey;
        this.cbDown = callbackDown || (() => { });
        this.cbUp = callbackUp || (() => { });

        // Configuration
        this.isClicked = false;     // Used for toggle mode
        this.needClicked = false;   // If true, behaves like a checkbox/toggle
        this.isHeldDown = false;    // Track if button is actively being pressed
        this.sfx = null;            // Placeholder for click sounds

        // Add to scene and enable input
        scene.add.existing(this);
        this.setInteractive({ useHandCursor: true });

        this.setupEvents();
    }

    init() {
        this.isClicked = false;
        this.isHeldDown = false;
        this.setNormalState();
    }

    setupEvents() {
        this.on('pointerdown', this.handleDown, this);
        this.on('pointerup', this.handleUp, this);
        this.on('pointerover', this.handleOver, this);
        this.on('pointerout', this.handleOut, this);
    }

    handleDown() {
        if (!this.input?.enabled) return;

        this.playButtonClick();
        this.isHeldDown = true;

        if (this.needClicked) {
            this.isClicked = !this.isClicked;
            if (this.isClicked) {
                this.setPressedState();
                this.cbDown();
            } else {
                this.setNormalState();
                this.cbUp();
            }
        } else {
            this.setPressedState();
            this.cbDown();
        }
    }

    handleUp() {
        if (!this.input?.enabled) return;
        this.isHeldDown = false;
        if (!this.needClicked) {
            this.setNormalState();
            this.cbUp();
        }
    }

    handleOver() {
        if (!this.input?.enabled || this.isClicked) return;

        this.setPressedState();

        // Subtle hover effect: scale up slightly
        this.scene.tweens.add({
            targets: this,
            scale: 1.05,
            duration: 100
        });
    }

    handleOut() {
        if (!this.input?.enabled) return;
        if (!this.isClicked) {
            this.setNormalState();

            if (!this.needClicked && this.isHeldDown) {
                this.isHeldDown = false;
                this.cbUp();
            }
        }
    }
    setPressedState() {
        if (this.pressedKey) this.setTexture(this.pressedKey);



        // Haptic feel: shrink slightly when pressed
        this.scene.tweens.add({
            targets: this,
            scale: 0.92,
            duration: 50
        });
    }

    setNormalState() {
        if (this.normalKey) this.setTexture(this.normalKey);

        this.scene.tweens.add({
            targets: this,
            scale: 1,
            duration: 100
        });
    }

    setActive(canEnable) {
        if (!canEnable) {
            this.disableInteractive();
            this.setTint(0x888888); // Greyscale look
            this.setAlpha(0.7);
        } else {
            this.setInteractive();
            this.clearTint();
            this.setAlpha(1);
        }
    }

    resetStatus() {
        this.isClicked = false;
        this.setNormalState();
    }

    playButtonClick() {
        // Example: if you have a global sound manager
        // this.scene.sound.play('click_sfx', { volume: 0.5 });
    }
}

/**
 * STANDARD BUTTON
 * Includes hover and out effects
 */
export class CustomButton extends BaseButton {
    constructor(scene, x, y, normalKey, pressedKey, callbackDown, callbackUp) {
        super(scene, x, y, normalKey, pressedKey, callbackDown, callbackUp);
    }
}

/**
 * LIGHT BUTTON
 * Minimal version (e.g., for language selection) - omits hover/out scaling
 */
export class CustomButton2 extends BaseButton {
    handleOver() {
        // Override: Do nothing on hover for a "lighter" UI feel
    }
    handleOut() {
        // Override: Keep it simple
        if (!this.isClicked) this.setNormalState();
    }
}