import React from 'react';
import { getEnv } from '@/utils/env';
import { EnvProvider } from './EnvContext';

export function withRootCtx(Component: React.FC) {
  const env = getEnv();

  return function C(props: any) {
    return (
      <EnvProvider value={env}>
        <Component {...props} />
      </EnvProvider>
    );
  }
}