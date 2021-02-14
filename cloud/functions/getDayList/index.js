const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const dayTable = db.collection('day');
  const { openId } = event.userInfo;
  console.log('event', event);

  try {
    const { data } = await dayTable.where({
      hostOpenId: _.eq(openId),
      active: _.eq(true),
    }).orderBy('createTime', 'desc').get();
    console.log('data', data);

    if (Array.isArray(data) && data.length > 0) {
      return {
        code: 2000,
        data,
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