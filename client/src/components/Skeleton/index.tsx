import React from 'react';
import { ListSk } from './ListSk';

export enum SkeletonType {
  List = 0,
}

interface SkeletonProps {
  loaded: boolean;
  children?: React.ReactNode;
  type: SkeletonType;
}

export default function Skeleton(props: SkeletonProps) {
  const {
    type,
    loaded,
    children,
  } = props;

  if (loaded && children) {
    return (
      <React.Fragment>
        {children}
      </React.Fragment>
    );
  }

  switch (type) {
    case SkeletonType.List:
      return <ListSk />;
    default:
      return null;
  }
}