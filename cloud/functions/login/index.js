const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event) => {
  const db = cloud.database();
  const userTable = db.collection('user');
  const { userName, avatar } = event;
  const { openId } = event.userInfo;
  console.log('event', event);

  if (typeof userName !== 'string'
    || !userName
    || typeof avatar !== 'string'
    || !avatar
  ) {
    return { code: 4000 };
  }

  try {
    const { data } = await userTable.where({
      openId: _.eq(openId),
    }).get();

    if (Array.isArray(data) && data.length > 0) { // update
      const { stats: { updated } } = await userTable.where({
        openId: _.eq(openId),
      }).update({
        data: {
          userName,
          avatar,
          updateTime: new Date(),
        }
      });
      if (updated !== 1) {
        throw new Error('更新失败');
      }
      return { code: 2000 };
    } else { // add
      const reqData = {
        openId,
        userName,
        avatar,
        createTime: new Date(),
        updateTime: new Date(),
      }
      await userTable.add({
        data: reqData
      });
      return { code: 2000 };
    }
  } catch (e) {
    console.log(e);
    return { code: 5000, msg: e };
  }
}