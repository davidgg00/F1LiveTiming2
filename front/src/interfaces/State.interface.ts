import { SessionInfo } from "./SessionInfo.interface"
import { DriverList } from "./Driver.interface"
import { TimingData } from "./TimingData.interface"
import { CarData } from "./CarData.interface"
import { WelcomePosition } from "./WelcomePosition.interface"
import { ExtrapolatedClock } from "./ExtrapolatedClock.interface"
import { TrackStatus } from "./TrackStatus.interface"
import { TimingAppData } from "./TimingAppData.interface"
import { TimingStats } from "./TimingStats.interface"
import { RaceControlMessages } from "./RaceControlMessages.interface"
import { LapCount } from "./LapCount.interface"

export interface State {
    //Heartbeat: Heartbeat
    //"CarData.z": string
    //"Position.z": string
    ExtrapolatedClock: ExtrapolatedClock
    TimingStats: TimingStats
    TimingAppData: TimingAppData
    // WeatherData: WeatherData
    TrackStatus: TrackStatus
    DriverList?: DriverList
    RaceControlMessages: RaceControlMessages
    SessionInfo?: SessionInfo
    // SessionData: SessionData
    TimingData?: TimingData
    // TeamRadio: TeamRadio
    CarData?: CarData
    Position: WelcomePosition;
    LapCount?: LapCount;

}