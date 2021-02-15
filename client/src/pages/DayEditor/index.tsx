import React, { useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { BaseEventOrig, Input, Picker, View } from '@tarojs/components';
import { InputProps } from '@tarojs/components/types/Input';
import { default as calendarUtils } from 'calendar';
import { DayItem, DayValue } from '@/utils/types';
import { dayValueToLunarString, dayValueToSolarString, lunarCalendarToValue, solarCalendarToValue } from '@/utils/calendarTrans';
import Button, { ButtonType } from '@/components/Button';
import { QueryProps, withQuery } from '@/components/withQuery';

import './index.less';

function Form(props: { title: string; children?: React.ReactNode }) {
  const { title, children } = props;
  return (
    <View className="form__item">
      <View className="form__title">{title}</View>
      <View className="form__content">
        {children}
      </View>
    </View>
  );
}

function DayEditor(props: QueryProps) {
  const { query } = props;
  const dayItem = useMemo(() => {
    return query?.dayItem ? JSON.parse(query?.dayItem) : undefined;
  }, [query?.dayItem]) as DayItem;
  const { _id: dayId, dayTop } = dayItem || {};

  const [dayName, setDayName] = useState(() => {
    return dayItem ? dayItem?.dayName : '';
  });

  const [dayValue, setDayValue] = useState<DayValue>(() => {
    if (dayItem) {
      return dayItem?.dayValue ?? {};
    }
    const today = new Date();
    return {
      isLunarCalendar: false,
      isLeapMonth: false,
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  });

  const dayString = useMemo(() => {
    const { isLunarCalendar } = dayValue || {};
    if (isLunarCalendar) {
      return dayValueToLunarString(dayValue);
    }
    return dayValueToSolarString(dayValue);
  }, [dayValue]);

  const onInputChange = (event: BaseEventOrig<InputProps.inputEventDetail>) => {
    const v = event?.detail?.value;
    setDayName(v);
  }

  const onLunarChange = (event: any) => {
    const v = event?.detail?.value;
    const { year, month, day, isLeapMonth, isLunarCalendar } = dayValue || {};
    if (v == '1' && !isLunarCalendar) {
      const lunarCalendar = calendarUtils.solar2lunar(year, month, day);
      const lunarDayValue = lunarCalendarToValue(lunarCalendar);
      setDayValue(lunarDayValue);
    } else if (v == '0' && isLunarCalendar) {
      const solarCalendar = calendarUtils.lunar2solar(year, month, day, isLeapMonth);
      const solarDayValue = solarCalendarToValue(solarCalendar);
      setDayValue(solarDayValue);
    }
  }

  const onDayChange = (event: any) => {
    const v = event?.detail?.value;
    setDayValue(v);
  }

  const createDay = async () => {
    if (!dayName || !dayValue) {
      wx.showToast({ title: '请填写完整', icon: 'error', duration: 1000 });
      return;
    }

    wx.showLoading({ title: '创建中..', mask: true });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'createDay',
        data: { dayName, dayValue },
      });
      const { code } = result || {};
      if (code === 2000) {
        wx.hideLoading();
        wx.showToast({ title: '创建成功', icon: 'success', mask: true });
        
        // 通知
        Taro.eventCenter.trigger('getDayListEvent');
        Taro.eventCenter.trigger('getDayEvent');
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
        return;
      }
      throw new Error(`code: ${code}`);
    } catch (e) {
      console.log(e);
      wx.hideLoading();
      wx.showToast({ title: '创建失败', icon: 'error', mask: true });
    }
  }

  const updateDay = async () => {
    if (!dayName || !dayValue) {
      wx.showToast({ title: '请填写完整', icon: 'error', duration: 1000 });
      return;
    }

    wx.showLoading({ title: '修改中..', mask: true });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'updateDay',
        data: { dayId, dayName, dayValue, dayTop },
      });
      const { code } = result || {};
      if (code === 2000) {
        wx.hideLoading();
        wx.showToast({ title: '修改成功', icon: 'success', mask: true });

        // 通知
        Taro.eventCenter.trigger('getDayListEvent');
        Taro.eventCenter.trigger('getDayEvent');
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
        return;
      }
      throw new Error(`code: ${code}`);
    } catch (e) {
      console.log(e);
      wx.hideLoading();
      wx.showToast({ title: '修改失败', icon: 'error', mask: true });
    }
  }

  const onSaveDay = async () => {
    if (dayId) {
      updateDay();
    } else {
      createDay();
    }
  }

  useEffect(() => {
    if (dayId) {
      wx.setNavigationBarTitle({ title: '编辑日子' });
    } else {
      wx.setNavigationBarTitle({ title: '创建日子' });
    }
  });

  return (
    <View className="day-editor">
      <Form title="📝 名称">
        <Input
          className="day-editor__day-name"
          value={dayName}
          onInput={onInputChange}
          placeholder="输入日子名称，例如：“👩 妈妈的生日”"
          placeholderClass="day-editor__placeholder"
          maxlength={50}
        />
      </Form>
      <Form title="📅 日期">
        <View className="day-editor__day-container">
          <Picker
            className="day-editor__lunar-wrap"
            mode="selector"
            range={['公历', '农历']}
            value={dayValue?.isLunarCalendar ? 1 : 0}
            onChange={onLunarChange}
          >
            <View className="day-editor__lunar">
              {dayValue?.isLunarCalendar ? '农历' : '公历'}
            </View>
          </Picker>
          <View className="day-editor__day-wrap">
            {/* @ts-ignore */}
            <date-picker onChange={onDayChange} value={dayValue}>
              <View className="day-editor__day">{dayString}</View>
              {/* @ts-ignore */}
            </date-picker>
          </View>
        </View>
      </Form>
      <Button type={ButtonType.Major} onClick={onSaveDay} className="day-editor__save">
        {dayId ? '保存' : '创建'}
      </Button>
    </View >
  );
}

export default withQuery(DayEditor);