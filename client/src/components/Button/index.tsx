import React from 'react';
import { ITouchEvent, View } from '@tarojs/components';
import cls from 'classcat';

import './index.less';

export enum ButtonType {
  Major = 'major',
  Minor = 'minor',
}

type ButtonProps = {
  type: ButtonType;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: ITouchEvent<any>) => void;
}

export default function Button(props: ButtonProps) {
  const {
    type,
    children,
    className = '',
    onClick = () => undefined
  } = props;

  return (
    <View
      className={cls([
        "button",
        className,
        {
          "major": type === ButtonType.Major,
          "minor": type === ButtonType.Minor,
        }
      ])}
      onClick={onClick}
    >
      {children}
    </View>
  );
}