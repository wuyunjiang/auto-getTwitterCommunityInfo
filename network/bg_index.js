export const getCommunitiesInfo = async (id) => {
  const res = await fetch(`https://twitter.com/i/communities/${id}/members`)
  let text = await res.text()

  const menberStrStartIndex = text.indexOf(`bundle.Communities":"`)
  const menberStrEndIndex = text.indexOf(`bundle.Communities":"`) + 28
  let memberUrl = text.substring(menberStrStartIndex, menberStrEndIndex)
  memberUrl = memberUrl.replace(`":"`, '.')
  memberUrl = `https://abs.twimg.com/responsive-web/client-web/${memberUrl}a.js`

  const TweetsStrStartIndex = text.indexOf(`,api:"`)
  const TweetsStrEndIndex = text.indexOf(`,api:"`) + 13
  let tweetsUrl = text.substring(TweetsStrStartIndex + 1, TweetsStrEndIndex)
  tweetsUrl = tweetsUrl.replace(`:"`, '.')
  tweetsUrl = `https://abs.twimg.com/responsive-web/client-web/${tweetsUrl}a.js`

  text = undefined
  /////////////////////////////////////////////////////////////////////////////////
  const memberRes = await fetch(memberUrl)
  const memberResText = await memberRes.text()
  const memberTempStrEndIndex = memberResText.indexOf(
    `",metadata:{sliceInfoPath:["communityResults","result","members_slice`
  )
  let memberTempStr = memberResText.substring(
    memberTempStrEndIndex - 50,
    memberTempStrEndIndex
  )
  const memberTempStrStartIndex = memberTempStr.indexOf(`{id:"`)
  const memberAppUid = memberTempStr.substring(memberTempStrStartIndex + 5)

  /////////////////////////////////////////////////////////////////////////////////
  const tweetsRes = await fetch(tweetsUrl)
  const tweetsResText = await tweetsRes.text()
  const tweetsTempStrEndIndex = tweetsResText.indexOf(
    `",operationName:"CommunityTweetsTimeline"`
  )
  let tweetsTempStr = tweetsResText.substring(
    tweetsTempStrEndIndex - 50,
    tweetsTempStrEndIndex
  )
  const tweetsTempStrStartIndex = tweetsTempStr.indexOf(`{queryId:"`)
  const tweetsAppUid = tweetsTempStr.substring(tweetsTempStrStartIndex + 10)

  ////////////////////////////////////////////////////////////////////////////////
  const favoriteTempStrEndIndex = tweetsResText.indexOf(
    `",operationName:"Favoriters"`
  )
  let favoriteTempStr = tweetsResText.substring(
    favoriteTempStrEndIndex - 50,
    favoriteTempStrEndIndex
  )
  const favoriteTempStrStartIndex = favoriteTempStr.indexOf(`{queryId:"`)
  const favoritersUid = favoriteTempStr.substring(favoriteTempStrStartIndex + 10)

  ////////////////////////////////////////////////////////////////////////////////
  const detailTempStrEndIndex = tweetsResText.indexOf(
    `",operationName:"TweetDetail"`
  )
  let detailTempStr = tweetsResText.substring(
    detailTempStrEndIndex - 50,
    detailTempStrEndIndex
  )
  const detailTempStrStartIndex = detailTempStr.indexOf(`{queryId:"`)
  const tweertDetailUid = detailTempStr.substring(detailTempStrStartIndex + 10)

  const storageData = await chrome.storage.local.get()
  const { bgData } = storageData
  bgData.memberAppUid = memberAppUid
  bgData.tweetsAppUid = tweetsAppUid
  bgData.favoritersUid = favoritersUid
  bgData.tweertDetailUid = tweertDetailUid
  chrome.storage.local.set(storageData)
}
