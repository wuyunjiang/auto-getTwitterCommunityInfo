import { myConfig } from './config.js'
import {
  updateCommunityId,
  updateAuthToken,
  updateMemberList,
  updateTweetsInfo,
} from './bgExec.js'
import {
  requestFront,
  shouldGetMembers,
  shouldGetTweetLikerReplyer,
  downloadNoActiveMembers,
  shouldDownloadNoActiveMembers,
} from './helper/bg_index.js'

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case 'updateCommunityId':
      return updateCommunityId(request.data)
    case 'updateUserAuthToken':
      return updateAuthToken(request.data)
    default:
      break
  }
  return true
})

function startCheck() {
  setInterval(async () => {
    const storageData = await chrome.storage.local.get()
    const { bgData } = storageData
    if (bgData.communityId && bgData.authToken) {
      if (bgData.memberAppUid) {
        if (await shouldGetMembers()) {
          console.info('开始请求数据成员')
          const res = await requestFront('getAllMember', {
            memberAppUid: bgData.memberAppUid,
            authToken: bgData.authToken,
            communityId: bgData.communityId,
          })
          if (res?.data?.length) await updateMemberList(res.data)
        }
      }
      if (
        bgData.tweetsAppUid &&
        bgData.favoritersUid &&
        bgData.tweertDetailUid &&
        bgData.tweetsInfo
      ) {
        if (await shouldGetTweetLikerReplyer()) {
          console.info('开始获取最新帖子以及回复和喜欢')
          const res = await requestFront('getAllTweets', {
            tweetsAppUid: bgData.tweetsAppUid,
            favoritersUid: bgData.favoritersUid,
            tweertDetailUid: bgData.tweertDetailUid,
            tweetsInfo: bgData.tweetsInfo,
            authToken: bgData.authToken,
            communityId: bgData.communityId,
          })
          if (res) await updateTweetsInfo(res.data)
        }
      }
      if (await shouldDownloadNoActiveMembers()) {
        console.info('开始下载不活跃成员文件')
        await downloadNoActiveMembers()
      }
    }
  }, myConfig.checkInterval)
}

const main = async () => {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  if (!bgData) {
    await chrome.storage.local.set({
      bgData: {},
    })
  }
  startCheck()
}
main()

///////////////////////////////////////////////////////////////
setInterval(async () => {
  const storageData = await chrome.storage.local.get()
  console.log('实时bgData', storageData)
}, 1000)
