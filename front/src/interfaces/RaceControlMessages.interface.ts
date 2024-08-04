export interface RaceControlMessages {
  Messages: Message[];
  _kf: boolean;
}

export interface Message {
  Utc: Date;
  Category: string;
  Message: string;
  Flag?: string;
  Scope?: string;
}
