import GUI from "lil-gui"
import { DebugGUI } from "../class/DebugGUI"
import { PlayConfig } from "../class/PlayConfig"

import { Music, Beatmap } from "../class/Music"
import { MusicTile } from "../class/MusicTile"
import { MusicTileManager } from "../class/MusicTileManager"

type DIFFICULTY = 1 | 2 | 3 | 4
type KEY = 4 | 5 | 6 | 7

export class SelectScene extends Phaser.Scene {
    private gui: GUI
    private debugGUI: DebugGUI
    private debugParams: any

    private playButton: Phaser.GameObjects.Image
    private diffButtons: Phaser.GameObjects.Image[]
    private keyButtons: Phaser.GameObjects.Image[]

    private scrollBar: Phaser.GameObjects.Image

    private selectedDiffIcon: Phaser.GameObjects.Image
    private selectedKeyIcon: Phaser.GameObjects.Image

    private beatmapLevelText: Phaser.GameObjects.Text
    private nonPlayableText: Phaser.GameObjects.Text

    private difficulty: DIFFICULTY
    private key: KEY
    private isPlayable: boolean = false

    private musicList: Music[]
    private musicTileManager: MusicTileManager

    private backgroundCamera: Phaser.Cameras.Scene2D.Camera
    constructor() {
        super("select")

        this.gui = new GUI({ title: "Settings" })
        this.gui.domElement.style.setProperty("left", "15px")
        this.debugParams = { noteSpeed: 6.5, noteType: "rectangle" }
        const playFolder = this.gui.addFolder("Play Option")
        playFolder.add(this.debugParams, "noteSpeed", 1, 10).name("Note Speed")
        playFolder
            .add(this.debugParams, "noteType", ["rectangle", "circle"])
            .name("Note Type")
        this.gui.hide()
    }

    init() {
        this.gui.show()
        this.debugGUI = new DebugGUI(this)
        this.events.on(Phaser.Scenes.Events.TRANSITION_OUT, () => {
            this.debugGUI.destroy()
            this.gui.hide()
        })

        this.difficulty = 1
        this.key = 4

        this.musicList = this.cache.json.get("music-list")
    }
    create() {
        const { width, height } = this.game.canvas

        this.backgroundCamera = this.cameras.add(0, 0, 1280, 720)
        this.backgroundCamera.setScroll(1280, 720)
        this.cameras.add(0, 0, 1280, 720, true)
        this.add
            .shader("background", width / 2 + 1280, height / 2 + 720, 1280, 720)
            .setDepth(-5)

        // @ts-expect-error
        this.plugins.get("rexKawaseBlurPipeline").add(this.backgroundCamera, {
            blur: 8,
            quality: 8,
        })

        this.add.image(52, 15, "frame-title").setScale(0.7, 0.45).setOrigin(0, 0)

        this.add.image(52, 635, "frame-title").setScale(0.7, 0.45).setOrigin(0, 0)

        this.add
            .text(80, 20, "難易度を変更", {
                fontFamily: "Noto Sans JP",
                fontSize: "30px",
                color: "#f0f0f0",
            })
            .setOrigin(0, 0)
            .setScale(0.5)

        this.add
            .text(80, 640, "使用するキーの数を変更", {
                fontFamily: "Noto Sans JP",
                fontSize: "30px",
                color: "#f0f0f0",
            })
            .setOrigin(0, 0)
            .setScale(0.5)

        this.add
            .text(975, 460, "LEVEL", {
                fontFamily: "Oswald",
                fontSize: "50px",
                color: "#bbbbbb",
            })
            .setOrigin(0, 1)
            .setScale(0.5)
            .setDepth(3)

        this.beatmapLevelText = this.add
            .text(1085, 463, "?", {
                fontFamily: "Oswald",
                fontSize: "75px",
                color: "#fafafa",
            })
            .setOrigin(1, 1)
            .setScale(0.5)
            .setDepth(3)

        this.nonPlayableText = this.add
            .text(1030, 500, "この譜面はプレイできません。", {
                fontFamily: "Noto Sans JP",
                fontSize: "35px",
                color: "#f0f0f0",
            })
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
            .setDepth(3)

        this.diffButtons = []
        for (const diffIndex of Array(4).keys()) {
            this.diffButtons.push(
                this.add
                    .image(80 + 180 * diffIndex, 50, `diff-icon-${diffIndex + 1}`)
                    .setOrigin(0, 0)
                    .setAlpha(diffIndex == this.difficulty - 1 ? 1 : 0.3)
                    .setDepth(10)
            )
        }
        for (const diffIndex of Array(4).keys()) {
            this.diffButtons[diffIndex]
                .setInteractive({
                    useHandCursor: true,
                })
                .on("pointerdown", () => {
                    this.difficulty = (diffIndex + 1) as DIFFICULTY
                    this.selectedDiffIcon.setTexture(`diff-icon-${diffIndex + 1}`)
                    for (const diffIndex of Array(4).keys()) {
                        this.diffButtons[diffIndex].setAlpha(
                            diffIndex == this.difficulty - 1 ? 1 : 0.3
                        )
                    }
                })
        }

        this.keyButtons = []
        for (const keyIndex of Array(4).keys()) {
            this.keyButtons.push(
                this.add
                    .image(80 + 180 * keyIndex, 670, `key-icon-${keyIndex + 4}`)
                    .setOrigin(0, 0)
                    .setAlpha(keyIndex == this.key - 4 ? 1 : 0.3)
                    .setDepth(10)
            )
        }
        for (const keyIndex of Array(4).keys()) {
            this.keyButtons[keyIndex]
                .setInteractive({
                    useHandCursor: true,
                })
                .on("pointerdown", () => {
                    this.key = (keyIndex + 4) as KEY
                    this.selectedKeyIcon.setTexture(`key-icon-${keyIndex + 4}`)
                    for (const keyIndex of Array(4).keys()) {
                        this.keyButtons[keyIndex].setAlpha(
                            keyIndex == this.key - 4 ? 1 : 0.3
                        )
                    }
                })
        }
        this.musicTileManager = new MusicTileManager(this)

        this.add.image(30, 360, "scroll-bar-frame").setOrigin(0.5, 0.5)

        this.scrollBar = this.add.image(30, 360, "scroll-bar").setOrigin(0.5, 0.5)

        this.add.image(830, 120, "music-detail-frame").setOrigin(0, 0)

        this.add
            .rectangle(830 + 200, 280, 270, 270, 0xffffff)
            .setOrigin(0.5, 0.5)
            .setDepth(1)

        this.selectedKeyIcon = this.add
            .image(830 + 70, 140, `key-icon-${this.key}`)
            .setOrigin(0, 0)
            .setDepth(2)
            .setScale(0.5)

        this.selectedDiffIcon = this.add
            .image(830 + 70 + 90, 140, `diff-icon-${this.difficulty}`)
            .setOrigin(0, 0)
            .setDepth(2)
            .setScale(0.5)

        this.playButton = this.add
            .image(830 + 200, 500, "play-button-enable")
            .setOrigin(0.5, 0.5)
            .setDepth(1)

        this.add.image(830, 650, "config-frame").setOrigin(0, 0.5)
        this.add
            .text(830 + 400 * 0.2, 680, "プレイ設定", {
                fontFamily: "Noto Sans JP",
                fontSize: "26px",
                color: "#f0f0f0",
            })
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
        this.add
            .image(830 + 400 * 0.2, 640, "icon-config")
            .setOrigin(0.5, 0.5)
            .setDepth(1)

        this.add
            .text(830 + 400 * 0.5, 680, "IRにログイン", {
                fontFamily: "Noto Sans JP",
                fontSize: "26px",
                color: "#f0f0f0",
            })
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
            .setAlpha(0.3)
        this.add
            .image(830 + 400 * 0.5, 640, "icon-ir")
            .setOrigin(0.5, 0.5)
            .setDepth(1)
            .setAlpha(0.3)
        this.add
            .text(830 + 400 * 0.8, 680, "クレジット", {
                fontFamily: "Noto Sans JP",
                fontSize: "26px",
                color: "#f0f0f0",
            })
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
        this.add
            .image(830 + 400 * 0.8, 640, "icon-credit")
            .setOrigin(0.5, 0.5)
            .setDepth(1)

        this.add.image(5, 5, "icon-help").setOrigin(0, 0).setAlpha(0.5).setDepth(1)

        const ascScrollZone = this.add
            .zone(100, 100, 570, 200)
            .setOrigin(0, 0)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.musicTileManager.scroll(false)
            })
        const descScrollZone = this.add
            .zone(100, 620, 570, 200)
            .setOrigin(0, 1)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.musicTileManager.scroll(true)
            })

        this.playButton
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                if (this.isPlayable) {
                    this.cameras.main.fadeOut(500)
                }
            })
        this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            () => {
                this.scene.start("play", {
                    music: this.musicTileManager.getMusic(),
                    beatmap: this.musicTileManager.getBeatmap(this.key, this.difficulty),
                    playConfig: new PlayConfig({
                        noteSpeed: this.debugParams.noteSpeed,
                        noteType: this.debugParams.noteType,
                        key: this.key,
                        difficulty: this.difficulty,
                    }),
                })
            }
        )
        this.cameras.main.fadeIn(500)
    }

    update(time: number, dt: number) {
        this.musicTileManager.update(time)

        this.isPlayable = this.musicTileManager.isPlayable(
            this.key,
            this.difficulty
        )
        if (this.isPlayable) {
            this.playButton.setTexture("play-button-enable").setAlpha(1)
            this.nonPlayableText.setVisible(false)
            this.beatmapLevelText.setText(
                this.musicTileManager.getBeatmap(this.key, this.difficulty).playlevel
            )
        } else {
            this.playButton.setTexture("play-button-disable").setAlpha(0.5)
            this.nonPlayableText.setVisible(true)
            this.beatmapLevelText.setText("?")
        }

        this.scrollBar.setY(360 + 235 * (2 * this.musicTileManager.scrollRate - 1))
    }
}
