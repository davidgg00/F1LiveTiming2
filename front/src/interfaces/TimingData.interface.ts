import { LastLapTime } from "./LastLapTime.interface"
import { Sectors } from "./Sectors.interface"
import { Speeds } from "./Speeds.interface"

export interface TimingData {
    Lines: { [key: string]: TimingDataLine };
    Withheld: boolean;
    _kf: boolean;
    NoEntries:        number[];
    SessionPart:      number;
    CutOffTime:       string;
    CutOffPercentage: string;
}

export interface TimingDataLine {
    TimeDiffToFastest: string;
    TimeDiffToPositionAhead: string;
    Line: number;
    Position: string;
    ShowPosition: boolean;
    RacingNumber: string;
    Retired: boolean;
    InPit: boolean;
    PitOut: boolean;
    Stopped: boolean;
    Status: number;
    Sectors: SectorElement[] | { [key: string]: SectorValue };
    Speeds: Speeds;
    BestLapTime: BestLapTime;
    LastLapTime: LastLapTime;
    NumberOfLaps?: number;
    NumberOfPitStops?: number;
    KnockedOut: boolean,
    Stats:                   Stat[];
    BestLapTimes:            Best[];
}

export interface Stat {
    TimeDiffToFastest:       string;
    TimeDifftoPositionAhead: string;
}

export interface Best {
    Value?: string;
}


export interface DriverTimingData {
    TimeDiffToFastest: string
    TimeDiffToPositionAhead: string
    Line: number
    Position: string
    ShowPosition: boolean
    RacingNumber: string
    Retired: boolean
    InPit: boolean
    PitOut: boolean
    Stopped: boolean
    Status: number
    Sectors: Sectors
    Speeds: Speeds
    BestLapTime: BestLapTime
    LastLapTime: LastLapTime
    NumberOfLaps: number,
    KnockedOut: boolean
}

export interface BestLapTime {
    Value: string
    Lap: number
}

export interface SectorElement {
    Stopped: boolean;
    Value: string;
    Status: number;
    OverallFastest: boolean;
    PersonalFastest: boolean;
    Segments: Segment[];
    PreviousValue?: string;
}

export interface SectorValue {
    Stopped: boolean;
    Value: string;
    Status: number;
    OverallFastest: boolean;
    PersonalFastest: boolean;
    Segments: { [key: string]: Segment };
    PreviousValue?: string;
}

export interface Segment {
    Status: number;
}