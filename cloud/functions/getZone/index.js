const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const zoneTable = db.collection('zone');
  const { zoneId } = event;
  console.log('event', event);

  if (typeof zoneId !== 'string' || !zoneId) {
    return { code: 4000 };
  }

  try {
    const { data } = await zoneTable.where({
      _id: _.eq(zoneId)
    }).get();
    console.log('data', data);

    if (Array.isArray(data) && data.length > 0) {
      return {
        code: 2000,
        data: data[0],
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