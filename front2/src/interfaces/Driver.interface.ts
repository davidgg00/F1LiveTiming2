export interface DriverList {
    "1"?: Driver;
    "2"?: Driver;
    "3"?: Driver;
    "4"?: Driver;
    "10"?: Driver;
    "11"?: Driver;
    "14"?: Driver;
    "16"?: Driver;
    "18"?: Driver;
    "20"?: Driver;
    "22"?: Driver;
    "23"?: Driver;
    "24"?: Driver;
    "27"?: Driver;
    "31"?: Driver;
    "44"?: Driver;
    "55"?: Driver;
    "63"?: Driver;
    "77"?: Driver;
    "81"?: Driver;
}

export interface Driver {
    RacingNumber: string
    BroadcastName: string
    FullName: string
    Tla: string
    Line: number
    TeamName: string
    TeamColour: string
    FirstName: string
    LastName: string
    Reference: string
    HeadshotUrl: string
    CountryCode: string
}
