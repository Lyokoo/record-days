import React from 'react';
import { View } from '@tarojs/components';
import { GreyBar } from '../GreyBar';

import './index.less';

export const ListSk = () => {
  return (
    <View className="home-sk__list">
      {Array.from({ length: 6 }, () => (
        <View className="home-sk__item">
          <GreyBar className="home-sk__item-title" />
          <GreyBar className="home-sk__item-day" />
        </View>
      ))}
    </View>
  );
}