const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const dayTable = db.collection('day');
  const { dayId, dayName, dayTop, dayValue } = event;
  const { openId } = event.userInfo;
  console.log('event', event);

  if (typeof dayId !== 'string'
    || !dayId
    || typeof dayName !== 'string'
    || !dayName
    || !dayValue
  ) {
    return { code: 4000 };
  }

  try {
    const { stats: { updated } } = await dayTable.where({
      _id: _.eq(dayId),
      hostOpenId: _.eq(openId),
    }).update({
      data: {
        dayName,
        dayValue,
        dayTop: Boolean(dayTop),
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