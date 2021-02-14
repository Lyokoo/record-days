import React, { useEffect, useState } from 'react';
import { ITouchEvent, View } from '@tarojs/components';
import { withRootCtx } from '@/components/withRootCtx';
import { DayValue } from '@/utils/types';
import { dayValueToLunarString, dayValueToSolarString } from '@/utils/calendarTrans';

import './index.less';
import Skeleton, { SkeletonType } from '@/components/Skeleton';

type DayList = {
  _id: string;
  dayName: string;
  dayValue: DayValue;
}[];

function Home() {
  const [list, setList] = useState<DayList>([]);
  const [loaded, setLoaded] = useState(false);

  const getDayList = async () => {
    try {
      wx.showLoading({ title: '获取中..', mask: true });
      const { result } = await wx.cloud.callFunction({
        name: 'getDayList',
      });
      console.log('result', result);
      const { code, data } = result || {};
      if (code === 2000) {
        setList(data);
        return;
      }
      throw new Error(`code: ${code}`);
    } catch (e) {
      console.log(e);
    } finally {
      wx.hideLoading();
      setLoaded(true);
    }
  }

  const onAddDay = (e: ITouchEvent) => {
    e.stopPropagation();
    wx.navigateTo({ url: '/pages/DayEditor/index' });
  }

  useEffect(() => {
    getDayList();
  }, []);

  return (
    <View className="home">
      <View className="home__header">
        <View className="home__header-title">日子列表</View>
        <View className="home__header-add" onClick={onAddDay}>添加</View>
      </View>
      <View className="home__container">
        <Skeleton type={SkeletonType.List} loaded={loaded}>
          {Array.isArray(list) && list.length
            ? (
              <View className="home__list">
                {list.map(item => {
                  const { dayValue, dayName, _id } = item || {};
                  const { isLunarCalendar } = dayValue || {};
                  const dayString = isLunarCalendar ? dayValueToLunarString(dayValue) : dayValueToSolarString(dayValue);
                  return (
                    <View className="home__item" key={_id}>
                      <View className="home__item-title">{dayName}</View>
                      <View className="home__item-day">{dayString}</View>
                    </View>
                  );
                })}
              </View>
            ) : <View className="home__list-empty">🙈 空空如也～</View>
          }
        </Skeleton>
      </View>
    </View>
  );
}

export default withRootCtx(Home);