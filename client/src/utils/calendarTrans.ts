import { DayValue } from "./types";
import { default as calendarUtils } from 'calendar';

export function lunarCalendarToValue(calendar: any) {
  const { lYear: year, lMonth: month, lDay: day, isLeap: isLeapMonth } = calendar;
  return {
    year,
    month,
    day,
    isLeapMonth,
    isLunarCalendar: true,
  };
}

export function solarCalendarToValue(calendar: any) {
  const { cYear: year, cMonth: month, cDay: day } = calendar;
  return {
    year,
    month,
    day,
    isLeapMonth: false,
    isLunarCalendar: false,
  };
}

export function dayValueToSolarString(dayValue: DayValue) {
  const { year, month, day, isLunarCalendar } = dayValue || {};
  if (!isLunarCalendar) {
    // @ts-ignore
    const { ncWeek } = calendarUtils.solar2lunar(year, month, day);
    return `${year}-${month}-${day} ${ncWeek}`;
  }
}

export function dayValueToLunarString(dayValue: DayValue) {
  const { year, month, day, isLunarCalendar, isLeapMonth } = dayValue || {};
  if (isLunarCalendar) {
    // @ts-ignore
    const { gzYear, lYear, IMonthCn, IDayCn } = calendarUtils.lunar2solar(year, month, day, isLeapMonth);
    return `${gzYear}(${lYear}) ${IMonthCn} ${IDayCn}`;
  }
  return '';
}