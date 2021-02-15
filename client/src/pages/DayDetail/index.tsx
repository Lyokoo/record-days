import React, { useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { default as calendarUtils } from 'calendar';
import { View } from '@tarojs/components';
import { QueryProps, withQuery } from '@/components/withQuery';
import { DayItem } from '@/utils/types';
import Button, { ButtonType } from '@/components/Button';
import { countDay, dayValueToLunarString, dayValueToSolarString, solarCalendarToValue } from '@/utils/calendarTrans';

import './index.less';

function DayDetail(props: QueryProps) {
  const { query } = props;
  const dayItem = useMemo(() => {
    return query?.dayItem ? JSON.parse(query?.dayItem) : undefined;
  }, [query?.dayItem]) as DayItem;

  const { _id: dayId } = dayItem || {};

  const [dayName, setDayName] = useState(dayItem?.dayName ?? '');
  const [dayTop, setDayTop] = useState(dayItem?.dayTop);
  const [dayValue, setDayValue] = useState(dayItem?.dayValue ?? {});

  const { isLunarCalendar, month, day, isLeapMonth } = dayValue || {};

  const countDayObj = useMemo(() => countDay(dayValue), [dayValue]);
  const { totalDay, isFuture, yearCnt, monthCnt, dayCnt } = countDayObj || {};

  const dayString = useMemo(() => {
    return isLunarCalendar ? dayValueToLunarString(dayValue) : dayValueToSolarString(dayValue);
  }, [isLunarCalendar, dayValue]);

  const ymdString = (() => {
    const yearString = `${yearCnt ? ` ${yearCnt} 年` : ''}`;
    const monthString = `${monthCnt ? ` ${monthCnt} 月` : ''}`;
    const dayString = `${dayCnt ? ` ${dayCnt} 天` : ''}`;
    const finalString = yearCnt || monthCnt || dayCnt ? `${yearString}${monthString}${dayString}` : ' 0 天';
    return `${isFuture ? '距离日子还有' : '已经过去了'}${finalString}`;
  })();

  const lunarInThisYear = useMemo(() => {
    if (isLunarCalendar) {
      const solarCalendar = calendarUtils.lunar2solar(new Date().getFullYear(), month, day, isLeapMonth);
      const solarDayValue = solarCalendarToValue(solarCalendar);
      return `今年: ${dayValueToSolarString(solarDayValue)}`;
    }
    return '';
  }, [isLunarCalendar, month, day, isLeapMonth]);

  const getDay = async () => {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getDay',
        data: { dayId },
      });
      console.log('getDay', result);
      const { code, data } = result || {};
      if (code === 2000) {
        setDayName(data?.dayName ?? '');
        setDayTop(data?.dayTop);
        setDayValue(data?.dayValue ?? {});
        return;
      }
      throw new Error(`code: ${code}`);
    } catch (e) {
      console.log(e);
    }
  }

  const deleteDay = async () => {
    try {
      wx.showLoading({ title: '删除中..', mask: true });
      const { result } = await wx.cloud.callFunction({
        name: 'deleteDay',
        data: { dayId }
      });
      const { code } = result || {};
      if (code === 2000) {
        wx.hideLoading();
        wx.showToast({ title: '删除成功', icon: 'success', mask: true });

        // 通知
        Taro.eventCenter.trigger('getDayListEvent');
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
        return;
      }
      throw new Error(`code: ${code}`);
    } catch (e) {
      console.log(e);
      wx.hideLoading();
      wx.showToast({ title: '删除失败', icon: 'error', mask: true });
    }
  }

  const toggleDayTop = async () => {
    if (!dayName || !dayValue) {
      wx.showToast({ title: '操作失败', icon: 'error', duration: 1000 });
      return;
    }

    wx.showLoading({ title: '操作中..', mask: true });
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'updateDay',
        data: { dayId, dayName, dayValue, dayTop: !dayTop },
      });
      const { code } = result || {};
      if (code === 2000) {
        wx.hideLoading();
        wx.showToast({ title: '操作成功', icon: 'success', mask: true });

        // 通知
        Taro.eventCenter.trigger('getDayListEvent');
        Taro.eventCenter.trigger('getDayEvent');
        return;
      }
      throw new Error(`code: ${code}`);
    } catch (e) {
      console.log(e);
      wx.hideLoading();
      wx.showToast({ title: '操作失败', icon: 'error', mask: true });
    }
  }

  const onEditDay = () => {
    wx.navigateTo({
      url: `/pages/DayEditor/index?dayItem=${encodeURIComponent(JSON.stringify({
        _id: dayId,
        dayName,
        dayTop,
        dayValue,
      }))}`,
    });
  }

  const onMoreAction = () => {
    wx.showActionSheet({
      itemList: [
        dayTop ? '取消置顶' : '置顶',
        '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          toggleDayTop();
        }
        if (res.tapIndex === 1) {
          wx.showModal({
            title: '提示',
            content: `确定删除当前日子？`,
            cancelColor: '#999999',
            confirmColor: '#6190e8',
            showCancel: true,
            success: () => {
              deleteDay();
            }
          });
        }
      }
    });
  }

  useEffect(() => {
    const handler = () => {
      getDay();
    };
    
    Taro.eventCenter.on('getDayEvent', handler);
    return () => {
      Taro.eventCenter.off('getDayEvent', handler);
    }
  }, []);

  return (
    <View className="day-detail">
      <View className="day-detail__header">
        <View className="day-detail__title">{dayName}</View>
        <View className="day-detail__title-desc">{dayString}</View>
        <View className="day-detail__day">{totalDay}</View>
        <View className="day-detail__day-desc">{ymdString}</View>
        {isLunarCalendar ? <View className="day-detail__this-year">{lunarInThisYear}</View> : null}
      </View>
      <View className="day-detail__footer">
        <Button type={ButtonType.Major} className="day-detail__btn-1" onClick={onEditDay}>编辑日子</Button>
        <Button type={ButtonType.Minor} className="day-detail__btn-2" onClick={onMoreAction}>更多操作</Button>
      </View>
    </View>
  );
}

export default withQuery(DayDetail);