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
  } as DayValue;
}

export function solarCalendarToValue(calendar: any) {
  const { cYear: year, cMonth: month, cDay: day } = calendar;
  return {
    year,
    month,
    day,
    isLeapMonth: false,
    isLunarCalendar: false,
  } as DayValue;
}

// dayValue ==> 公历展示文案
export function dayValueToSolarString(dayValue: DayValue) {
  const { year, month, day, isLunarCalendar } = dayValue || {};
  if (!isLunarCalendar) {
    // @ts-ignore
    const { ncWeek } = calendarUtils.solar2lunar(year, month, day);
    return `${year}-${month}-${day} ${ncWeek}`;
  }
  return '';
}

// dayValue ==> 农历展示文案
export function dayValueToLunarString(dayValue: DayValue) {
  const { year, month, day, isLunarCalendar, isLeapMonth } = dayValue || {};
  if (isLunarCalendar) {
    // @ts-ignore
    const { gzYear, lYear, IMonthCn, IDayCn } = calendarUtils.lunar2solar(year, month, day, isLeapMonth);
    return `${gzYear}(${lYear}) ${IMonthCn} ${IDayCn}`;
  }
  return '';
}

// 计算累计日数
export function countDay(dayValue: DayValue): {
  yearCnt: number;
  monthCnt: number;
  dayCnt: number;
  isFuture: boolean;
  totalDay: number;
} {
  const { isLeapMonth, isLunarCalendar, year, month, day } = dayValue || {};

  let solarDayValue: DayValue;

  if (isLunarCalendar) {
    const solarCalendar = calendarUtils.lunar2solar(year, month, day, isLeapMonth);
    solarDayValue = solarCalendarToValue(solarCalendar);
  } else {
    solarDayValue = dayValue;
  }

  const { year: sy, month: sm, day: sd } = solarDayValue || {};

  const today = new Date();
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1;
  const td = today.getDate();

  const targetDate = new Date(`${sy}/${sm < 10 ? `0${sm}` : sm}/${sd} 00:00:00`).getTime();
  const todayDate = new Date(`${ty}/${tm < 10 ? `0${tm}` : tm}/${td} 00:00:00`).getTime();

  const totalDay = Math.floor(Math.abs(todayDate - targetDate) / (1000 * 3600 * 24));
  const yearCnt = Math.floor(totalDay / 365);
  const monthCnt = Math.floor((totalDay % 365) / 30);
  const dayCnt = Math.floor((totalDay % 365) % 30);

  return {
    totalDay,
    yearCnt,
    monthCnt,
    dayCnt,
    isFuture: targetDate > todayDate,
  };
}