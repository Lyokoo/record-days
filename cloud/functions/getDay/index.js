const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const dayTable = db.collection('day');
  const { dayId } = event;
  const { openId } = event.userInfo;
  console.log('event', event);

  if (typeof dayId !== 'string' || !dayId) {
    return { code: 4000 };
  }

  try {
    const { data } = await dayTable.where({
      _id: _.eq(dayId)
    }).get();
    console.log('data', data);

    if (Array.isArray(data) && data.length > 0) {
      return {
        code: 2000,
        data: {
          ...data[0],
          isHost: data[0].hostOpenId === openId,
        },
      };
    } else {
      console.log('数据库错误');
      return { code: 5000 };
    }
  } catch (e) {
    console.log(e);
    return { code: 5000, msg: e };
  }
}