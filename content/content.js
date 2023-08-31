window.onload = async function () {
  const token = await getUserToken()
  requestBackground('updateUserAuthToken', token)
  setInterval(() => {
    console.log('活动中...')
  }, 1000)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getAllMember':
      getAllMember(request.data).then((list) => {
        sendResponse({ data: list })
      })
      return true
    case 'getAllTweets':
      getAllTweets(request.data).then((list) => {
        sendResponse({ data: list })
      })
      return true
    case 'downloadCsv':
      downloadCsv(request.data)
      return true
    default:
      break
  }
  return true
})
