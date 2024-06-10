import { Country } from "./Country.interface"

export interface SessionInfo {
    Meeting: Meeting
    ArchiveStatus: ArchiveStatus
    Key: number
    Type: string
    Number: number
    Name: string
    StartDate: string
    EndDate: string
    GmtOffset: string
    Path: string
    _kf: boolean
}

export interface Meeting {
    Key: number
    Name: string
    OfficialName: string
    Location: string
    Country: Country
    Circuit: Circuit
}

export interface Circuit {
    Key: number
    ShortName: string
}

export interface ArchiveStatus {
    Status: string
}