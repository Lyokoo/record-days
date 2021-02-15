import React, { useEffect, useMemo, useState } from 'react';
import cls from 'classcat';
import Taro from '@tarojs/taro';
import { ITouchEvent, View } from '@tarojs/components';
import { DayItem } from '@/utils/types';
import { countDay, dayValueToLunarString, dayValueToSolarString } from '@/utils/calendarTrans';
import Skeleton, { SkeletonType } from '@/components/Skeleton';

import './index.less';

type DayList = DayItem[];

function Home() {
  const [list, setList] = useState<DayList>([]);
  const [loaded, setLoaded] = useState(false);

  const getDayList = async () => {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getDayList',
      });
      console.log('getDayList', result);
      const { code, data } = result || {};
      if (code === 2000) {
        setList(data);
        return;
      }
      throw new Error(`code: ${code}`);
    } catch (e) {
      console.log(e);
    }
  }

  const onAddDay = (e: ITouchEvent) => {
    e.stopPropagation();
    wx.navigateTo({ url: '/pages/DayEditor/index' });
  }

  const onJumpDetail = (item: DayItem) => {
    wx.navigateTo({
      url: `/pages/DayDetail/index?dayItem=${encodeURIComponent(JSON.stringify(item))}`,
    });
  }

  useEffect(() => {
    (async () => {
      try {
        wx.showLoading({ title: '获取中..', mask: true });
        await getDayList();
      } catch (e) {
        //
      } finally {
        wx.hideLoading();
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    const handler = () => {
      getDayList();
    }

    Taro.eventCenter.on('getDayListEvent', handler);
    return () => {
      Taro.eventCenter.off('getDayListEvent', handler);
    }
  }, []);

  const finalList = useMemo(() => {
    return [...list.filter(v => v?.dayTop), ...list.filter(v => !v?.dayTop)].map(item => {
      const { dayValue } = item || {};
      const { isLunarCalendar } = dayValue || {};
      const dayString = isLunarCalendar ? dayValueToLunarString(dayValue) : dayValueToSolarString(dayValue);
      const { totalDay = 0 } = countDay(dayValue) || {};

      return {
        ...item,
        dayString,
        totalDay,
      };
    });
  }, [list]);

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
                {finalList.map(item => {
                  const { dayName, _id, dayTop, dayString, totalDay } = item || {};
                  return (
                    <View
                      className={cls([
                        "home__item",
                        { "is-top": dayTop }
                      ])}
                      key={_id}
                      onClick={() => onJumpDetail(item)}
                    >
                      <View className="home__item-title">{dayName}</View>
                      <View className="home__item-day">{dayString}</View>
                      <View className="home__total-wrap">
                        <View className="home__total-day">{`${totalDay} 天`}</View>
                      </View>
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

export default Home;