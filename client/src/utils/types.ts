export type DayValue = {
  isLeapMonth: boolean;
  isLunarCalendar: boolean;
  year: number;
  month: number;
  day: number;
};

export type DayItem = {
  _id: string;
  dayName: string;
  dayTop: boolean;
  dayValue: DayValue;
}