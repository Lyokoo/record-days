export interface Env {
  statusBarHeight: number;
  screenHeight: number;
  screenWidth: number;
  insetBottom: number;
}

let env: Env;

/** 同步获取 Env */
export function getEnv(): Env {
  if (env) {
    return env;
  }

  const systemInfo = wx.getSystemInfoSync();
  console.info('【systemInfo】', systemInfo);

  const {
    statusBarHeight,
    screenHeight,
    screenWidth,
    safeArea: { bottom },
  } = systemInfo || {};

  env = {
    statusBarHeight,
    screenHeight,
    screenWidth,
    insetBottom: (screenHeight - bottom) || 0,
  }

  return env;
}