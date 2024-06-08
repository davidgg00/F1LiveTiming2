import { Segments } from "./Segments.interface"

export interface Sectors {
    "0": SectorData
    "1": SectorData
    "2": SectorData
}

export interface SectorData {
    Stopped: boolean
    Value: string
    Status: number
    OverallFastest: boolean
    PersonalFastest: boolean
    Segments: Segments
    PreviousValue: string
}