export interface Speeds {
    I1: SpeedData
    I2: SpeedData
    FL: SpeedData
    ST: SpeedData
}

export interface SpeedData {
    Value: string
    Status: number
    OverallFastest: boolean
    PersonalFastest: boolean
}