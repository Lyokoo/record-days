import React, { useContext } from 'react';
import { Env } from '@/utils/env';

export const EnvContext = React.createContext({} as Env);

export const EnvProvider = EnvContext.Provider;

export const useEnv = () => useContext(EnvContext);