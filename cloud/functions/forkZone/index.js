const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const _ = db.command;
  const zoneTable = db.collection('zone');
  const { zoneName, targetZoneId } = event;
  const { openId } = event.userInfo;
  console.log('event', event);

  if (typeof targetZoneId !== 'string'
    || !targetZoneId
    || typeof zoneName !== 'string'
    || !zoneName
  ) {
    return { code: 4000 };
  }

  try {
    const { data: zoneData } = await zoneTable.where({
      _id: _.eq(targetZoneId)
    }).get();
    console.log('zoneData', zoneData);

    if (Array.isArray(zoneData) && zoneData.length > 0) {
      // data[0]
      const reqData = {
        hostOpenId: openId,
        zoneName,
        active: true,
        days: [...data[0].days],
        createTime: new Date(),
        updateTime: new Date(),
      }
      console.log('reqData', reqData);

      await zoneTable.add({
        data: reqData
      });
      return { code: 2000 };
    } else {
      console.log('数据库错误');
      return { code: 5000 };
    }
  } catch (e) {
    console.log(e);
    return { code: 5000, msg: e };
  }
}