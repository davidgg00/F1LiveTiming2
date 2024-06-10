export interface TimingStats {
    Withheld:    boolean;
    Lines:       { [key: string]: TimingStatsLine };
    SessionType: string;
    _kf:         boolean;
}

export interface TimingStatsLine {
    Line:                number;
    RacingNumber:        string;
    PersonalBestLapTime: PersonalBestLapTime;
    BestSectors:         BestSector[] | { [key: string]: FL };
    BestSpeeds:          BestSpeeds;
}

export interface PersonalBestLapTime {
    Value:    string;
    Lap?:      number;
    Position?: number;
}

export interface BestSector {
    Value: string;
}

export interface BestSpeeds {
    I1: FL;
    I2: FL;
    FL: FL;
    ST: FL;
}

export interface FL {
    Value:     string;
    Position?: number;
}