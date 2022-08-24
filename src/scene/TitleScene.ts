import { DebugGUI } from "../class/DebugGUI"

export class TitleScene extends Phaser.Scene {
    private debugGUI: DebugGUI
    constructor() {
        super("title")
    }

    init() {
        this.debugGUI = new DebugGUI(this)
        this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, () => {
            this.debugGUI.destroy()
        })
    }

    create() {
        const { width, height } = this.game.canvas

        this.add.text(0, 0, "title scene")

        const zone = this.add.zone(width / 2, height / 2, width, height)
        zone.setInteractive({
            useHandCursor: true,
        })
        zone.on("pointerdown", () => {
            //this.scene.start("select")
        })
    }
}
