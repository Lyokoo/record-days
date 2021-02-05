const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const zoneTable = db.collection('zone');
  const { zoneName } = event;
  const { openId } = event.userInfo;
  console.log('event', event);

  if (typeof zoneName !== 'string' || !zoneName) {
    return { code: 4000 };
  }

  try {
    // 文字内容合法性检测
    const { errCode } = await cloud.openapi.security.msgSecCheck({
      content: zoneName
    });
    if (errCode === 87014) {
      throw new Error('内容含有违法违规内容');
    }

    const reqData = {
      hostOpenId: openId,
      zoneName,
      active: true,
      days: [],
      createTime: new Date(),
      updateTime: new Date(),
    }
    console.log(reqData);

    await zoneTable.add({
      data: reqData
    });
    return { code: 2000 };
  } catch (e) {
    // {"errCode":-502001,"errMsg":"云资源数据库错误：数据库请求失败 "}
    console.log(e);
    if (typeof e === 'object' && e.errCode === -502001) {
      return { code: 5001, msg: e };
    }
    return { code: 5000, msg: e };
  }
}