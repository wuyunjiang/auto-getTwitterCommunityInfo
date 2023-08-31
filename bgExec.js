import { myConfig } from './config.js'
import {
  downloadNewTweetLikerAndReplyer,
  downloadAllMembers,
} from './helper/bg_index.js'
import { getCommunitiesInfo } from './network/bg_index.js'

export async function updateCommunityId(id) {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  if (bgData.communityId !== id) {
    getCommunitiesInfo(id)
    bgData.communityId = id
    bgData.tweetsInfo = {
      lastTweetTime: Date.now() - myConfig.firstTweetTime,
      list: [],
    }
    bgData.memberActiveList = []
    bgData.preDownloadNoActiveTime = 0
    bgData.preGetAllMemberTime = 0
    bgData.preGetTweetLikerReplyer = 0
    bgData.memberList = []
  }
  chrome.storage.local.set(storageData)
}

export async function updateAuthToken(token) {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  if (bgData.authToken !== token) {
    bgData.authToken = token
  }
  chrome.storage.local.set(storageData)
}

export async function updateMemberList(list) {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  bgData.memberList = list.map((_) => {
    const oldList = bgData.memberList || []
    const oldObj = oldList.find((old) => old.handleName === _.handleName) || {}
    return { ...oldObj, ..._ }
  })
  chrome.storage.local.set(storageData)
  await updateMemberListActiveTime(list)
  await downloadAllMembers(bgData.memberList)
}

export async function updateTweetsInfo(info) {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  bgData.tweetsInfo = info
  chrome.storage.local.set(storageData)
  await updateTweetsMemberActiveTime(info.list)
  await downloadNewTweetLikerAndReplyer(info.list)
}

async function updateMemberListActiveTime(list) {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  const tempList = bgData.memberActiveList || []
  for (let i = 0; i < list.length; i++) {
    const user = list[i]
    const targetUserIndex = tempList.findIndex(
      (_) => _.handleName === user.handleName
    )
    if (targetUserIndex !== -1) {
      if (user.lastActiveTime > (targetUserIndex.lastActiveTime || 0)) {
        tempList[targetUserIndex] = {
          ...user,
        }
      }
    } else {
      tempList.push({
        ...user,
        lastActiveTime: user.lastActiveTime || 0,
      })
    }
  }
  bgData.memberActiveList = tempList
  chrome.storage.local.set(storageData)
}

async function updateTweetsMemberActiveTime(list) {
  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  const tempList = bgData.memberActiveList || []
  for (let i = 0; i < list.length; i++) {
    const _ = list[i]
    const {
      likeUsers = [],
      replyUsers = [],
      authorName,
      authorHandleName,
      createTime,
    } = _
    const authorUserIndex = tempList.findIndex(
      (_) => _.handleName === authorHandleName
    )
    if (authorUserIndex !== -1) {
      if (createTime > (authorUserIndex.lastActiveTime || 0)) {
        tempList[authorUserIndex] = {
          name: authorName,
          handleName: authorHandleName,
          lastActiveTime: createTime,
        }
      }
    } else {
      tempList.push({
        name: authorName,
        handleName: authorHandleName,
        lastActiveTime: createTime,
      })
    }
    const allUsers = likeUsers.concat(replyUsers)
    for (let j = 0; j < allUsers.length; j++) {
      const user = allUsers[j]
      const targetUserIndex = tempList.findIndex(
        (_) => _.handleName === user.handleName
      )
      if (targetUserIndex !== -1) {
        if (user.lastActiveTime > (targetUserIndex.lastActiveTime || 0)) {
          tempList[targetUserIndex] = {
            ...user,
          }
        }
      } else {
        tempList.push({
          ...user,
          lastActiveTime: user.lastActiveTime || 0,
        })
      }
    }
  }
  bgData.memberActiveList = tempList
  chrome.storage.local.set(storageData)
}
