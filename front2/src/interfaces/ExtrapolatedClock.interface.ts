export interface ExtrapolatedClock {
    Utc: Date;
    Remaining: string;
    Extrapolating: boolean;
    _kf: boolean;
}