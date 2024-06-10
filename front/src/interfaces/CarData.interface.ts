export interface CarData {
    Entries: Entry[]
}

export interface Entry {
    Utc: string
    Cars: { [key: string]: Car };
}

export interface Car {
    Channels: { [key: string]: number };
}




/* export interface CarChannel {
    Channels: Channels
}
export interface Channels {
    "0": number
    "2": number
    "3": number
    "4": number
    "5": number
    "45": number
} */