const cloud = require('wx-server-sdk');
cloud.init();

/** 获取个人空间 / 订阅空间 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  const zoneTable = db.collection('zone');
  const { openId } = event.userInfo;
  const {
    listType, // "own" | "subscribe"
  } = event;
  console.log('event', event);

  if (listType !== 'own' && listType !== 'subscribe') {
    return { code: 4000 };
  }

  try {
    if (listType === 'own') {
      // res = { data: [], errMsg }
      const { data } = zoneTable.where({
        hostOpenId: _.eq(openId),
        active: _.eq(true),
      }).get();

      if (Array.isArray(data)) {
        return {
          code: 2000,
          data,
        };
      } else {
        throw new Error('记录数据结构不正确');
      }
    } else if (listType === 'subscribe') {
      // res = { data: [], errMsg }
      const { data } = zoneTable.where({
        listeners: _.elemMatch(_.eq(openId))
      }).get();

      if (Array.isArray(data)) {
        return {
          code: 2000,
          data,
        };
      } else {
        throw new Error('记录数据结构不正确');
      }
    }
  } catch (e) {
    console.log(e);
    return { code: 5000, msg: e };
  }
}