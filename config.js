export const myConfig = {
  firstTweetTime: 2 * 30 * 24 * 60 * 60 * 1000, // 首次拉取时间社区推文的时间最早，默认一个月前

  checkInterval: 0.5 * 60 * 1000, // 检查时间间隔, 每分钟检查一次

  getTweetLikerReplyer: 1 * 60 * 60 * 1000, // 获取新帖子以及下面的回复、点赞，每1小时获取一次

  getAllMemberInterval: 5 * 60 * 60 * 1000, // 获取所有成员时间间隔，每5小时获取一次

  getNoActiveMemberInterval: 1 * 24 * 60 * 60 * 1000, // 下载一个月内没有交互的用户数据，检查间隔，每天获取一次
}
