import React from 'react';
import cls from 'classcat';
import { View } from '@tarojs/components';

import './index.less';

interface Greybar {
  className?: string;
}

export const GreyBar = (props: Greybar) => {
  const { className = '' } = props;
  return (
    <View
      className={cls([
        "grey-bar",
        className
      ])}
    />
  );
};