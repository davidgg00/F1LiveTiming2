export interface TimingAppData {
    Lines: { [key: string]: TimingAppDataLine };
    _kf:   boolean;
}

export interface TimingAppDataLine {
    RacingNumber: string;
    Line:         number;
    Stints:       Stint[] | { [key: string]: Stint };
}

export interface Stint {
    LapFlags:        number;
    Compound:        Compound;
    New:             string;
    TyresNotChanged: string;
    TotalLaps:       number;
    StartLaps:       number;
    LapTime?:        string;
    LapNumber?:      number;
}

export enum Compound {
    Hard = "HARD",
    Medium = "MEDIUM",
    Soft = "SOFT",
    Wet = "WET",
    Intermediate = "INTERMEDIATE",
}
