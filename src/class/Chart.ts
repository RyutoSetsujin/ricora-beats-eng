import bms from "bms"

export interface SongInfo {
    title: string
    artist: string
    genre: string
    bpm: number
    level: number
    subtitle: string
    subartist: string
    stagefile: string
    difficulty: number
}

export class Chart {
    public bmsChart: any
    public timing: any
    public info: SongInfo

    constructor(public bmsSource: any) {
        this.bmsChart = bms.Compiler.compile(bmsSource).chart

        this.timing = bms.Timing.fromBMSChart(this.bmsChart)

        this.info = this.bmsChart.headers._data

        console.log(this.bmsChart, this.info)
    }

    public secondsToBeat(sec: number): number {
        return this.timing.secondsToBeat(sec)
    }

    public beatToBPM(beat: number): number {
        return this.timing.bpmAtBeat(beat)
    }
}
