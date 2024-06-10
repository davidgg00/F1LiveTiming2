export interface WelcomePosition {
    Position: PositionElement[];
}

export interface PositionElement {
    Timestamp: Date;
    Entries:   { [key: string]: EntryValue };
}

export interface EntryValue {
    Status: Status;
    X:      number;
    Y:      number;
    Z:      number;
}

export enum Status {
    OnTrack = "OnTrack", // todo
}