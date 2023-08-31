import { myConfig } from '../config.js'

export async function requestFront(action, data, cbk) {
  return new Promise((resolve) => {
    chrome.tabs.query({}, async function (tabs) {
      const activeTab = tabs.find((_) =>
        _.url.includes(`https://twitter.com/i/communities/`)
      )
      if (activeTab)
        chrome.tabs.sendMessage(activeTab.id, { action, data }, (res) => {
          resolve(res)
        })
    })
  })
}

export async function downloadNewTweetLikerAndReplyer(list = []) {
  const header = 'tweetId,tweetAuthor,tweetAuthorHandle,name,handle,type'
  let data = ''
  let templist = JSON.parse(JSON.stringify(list))
  templist.forEach((_) => {
    const {
      likeUsers = [],
      replyUsers = [],
      tweetId,
      authorName,
      authorHandleName,
    } = _
    const listStr = likeUsers.concat(replyUsers).map((_) => {
      delete _.lastActiveTime
      return JSON.stringify(_)
    })
    const allUsers = Array.from(new Set(listStr)).map((_) => JSON.parse(_))
    if (allUsers.length) {
      allUsers.forEach((user, i) => {
        const authorStr =
          i === 0
            ? `ID:${tweetId},${authorName.replace(
                /\,/g,
                ''
              )},${authorHandleName}`
            : ',,'
        const userStr = `,${user.name.replace(/\,/g, '')},${user.handleName},`
        const type = `${
          likeUsers.find((_) => _.handleName === user.handleName) ? 'liker' : ''
        }${
          replyUsers.find((_) => _.handleName === user.handleName)
            ? ' replyer'
            : ''
        }`
        data += authorStr + userStr + type + '\n'
      })
    } else {
      data +=
        `ID:${tweetId},${authorName.replace(/\,/g, '')},${authorHandleName}` +
        '\n'
    }
  })
  if (list.length) downloadCsv('TweetLikerAndReplyer', header, data)
}

export async function shouldGetMembers() {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  const preGetAllMemberTime = bgData.preGetAllMemberTime || 0
  if (Date.now() - preGetAllMemberTime > myConfig.getAllMemberInterval) {
    bgData.preGetAllMemberTime = Date.now()
    chrome.storage.local.set(storageData)
    return true
  } else {
    return false
  }
}

export async function downloadAllMembers() {
  const header = 'name,handle'
  let data = ''
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  const tempList = bgData.memberList
  for (let i = 0; i < tempList.length; i++) {
    const item = tempList[i]
    data += `${item.name.replace(/\,/g, '')},${item.handleName}\n`
  }
  if (data) downloadCsv('AllMemberList', header, data)
}

export async function downloadNoActiveMembers() {
  const header = 'name,handle,lastActiveTime'
  let data = ''
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  const tempList = bgData.memberActiveList
  for (let i = 0; i < tempList.length; i++) {
    const item = tempList[i]
    // 如果上次活跃是一个月前
    if (Date.now() - item.lastActiveTime > 1 * 30 * 24 * 60 * 60 * 1000) {
      data += `${item.name.replace(/\,/g, '')},${item.handleName},time:${
        item.lastActiveTime
      }\n`
    }
  }
  if (data) downloadCsv('NoActiveUsers', header, data)
}

export async function shouldDownloadNoActiveMembers() {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  const preDownloadNoActiveTime = bgData.preDownloadNoActiveTime || 0
  if (
    Date.now() - preDownloadNoActiveTime >
    myConfig.getNoActiveMemberInterval
  ) {
    bgData.preDownloadNoActiveTime = Date.now()
    chrome.storage.local.set(storageData)
    return true
  } else {
    return false
  }
}

export async function shouldGetTweetLikerReplyer() {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  const preGetTweetLikerReplyer = bgData.preGetTweetLikerReplyer || 0
  if (Date.now() - preGetTweetLikerReplyer > myConfig.getTweetLikerReplyer) {
    bgData.preGetTweetLikerReplyer = Date.now()
    chrome.storage.local.set(storageData)
    return true
  } else {
    return false
  }
}

export async function downloadCsv(name, header, data) {
  requestFront('downloadCsv', { name, header, data })
}
