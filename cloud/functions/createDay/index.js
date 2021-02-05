const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const zoneTable = db.collection('zone');
  const { dayName, targetDay, zoneId, isLunar } = event;
  const { openId } = event.userInfo;
  console.log('event', event);

  if (typeof dayName !== 'string'
    || !dayName
    || !targetDay instanceof Date
    || typeof zoneId !== 'string'
    || !zoneId
  ) {
    return { code: 4000 };
  }

  try {
    // 文字内容合法性检测
    const { errCode } = await cloud.openapi.security.msgSecCheck({
      content: dayName
    });
    if (errCode === 87014) {
      throw new Error('内容含有违法违规内容');
    }

    const createTime = new Date();
    const timeMs = createTime.getTime();

    const { stats: { updated } } = await zoneTable.where({
      _id: _.eq(zoneId),
      hostOpenId: _.eq(openId),
    }).update({
      data: {
        days: _.push([{
          _id: `${zoneId}_${timeMs}`,
          dayName,
          targetDay,
          active: true,
          isLunar: Boolean(isLunar),
          createTime: new Date(),
          updateTime: new Date(),
        }]),
        updateTime: new Date(),
      }
    });
    if (updated !== 1) {
      throw new Error('更新失败');
    }
    return { code: 2000 };
  } catch (e) {
    console.log(e);
    return { code: 5000, msg: e };
  }
}