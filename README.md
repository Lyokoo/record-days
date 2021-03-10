## 上手步骤

### 安装
```bash
# 进入 client 目录
cd client

# 使用 yarn 安装
yarn
```

### 运行调试

```bash
yarn dev
```

### 上传代码前构建

```bash
yarn build
```

## 数据库表结构

### Day

```typescript
type Day = {
  _id: string; // 自动生成的数据库 id
  hostOpenId: string; // 宿主 openId
  dayName: string; // 日子名称
  active: boolean; // 1-可用, 0-已删除
  dayTop: boolean; // 1-置顶, 0-非置顶
  dayValue: {
    isLeapMonth: boolean; // 是否润月
    isLunarCalendar: boolean; // 是否农历
    year: number;
    month: number;
    day: number;
  };
  createTime: Date; // 记录创建时间
  updateTime: Date; // 记录更新时间
}
```


## 相关文档

日子换算工具 https://github.com/jjonline/calendar.js