const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getUserToken = async () => {
  const tokenUrl = document
    .querySelector(
      "script[src^='https://abs.twimg.com/responsive-web/client-web/main.']"
    )
    .getAttribute('src')
  const res = await fetch(tokenUrl)
  let text = await res.text()
  const startIndex = text.indexOf(`,B=()=>"Bearer `) + 15
  const endIndex = text.indexOf(`",N=()=>"rweb"`)
  const authToken = text.substring(startIndex, endIndex)
  return authToken
}

async function getAllMember(data) {
  return new Promise(async (resolve) => {
    const tempList = []
    let next = null
    do {
      const res = await getCommunityNumber({
        memberAppUid: data.memberAppUid,
        authToken: data.authToken,
        params: {
          communityId: data.communityId,
          cursor: next,
        },
      })
      const resData = res?.data?.communityResults?.result?.members_slice
      const list = resData?.items_results || []
      next = resData?.slice_info?.next_cursor || undefined
      list.forEach((_) => {
        tempList.push({
          name: _?.result?.legacy?.name || 'no_name',
          handleName: _?.result?.legacy?.screen_name || 'no_handle_name',
        })
      })
    } while (next)
    resolve(tempList)
  })
}

async function getCommunityNumber(data) {
  const url = `https://twitter.com/i/api/graphql/${data.memberAppUid}/membersSliceTimeline_Query`
  const query = `?variables=${escapeParams(data.params)}`
  await sleep(500)
  const res = await fetch(url + query, {
    headers: {
      Authorization: `Bearer ${data.authToken}`,
      'X-Csrf-Token': getCookie('ct0'),
    },
  })
  const resData = await res.json()
  return resData
}

async function getAllTweets(data) {
  return new Promise(async (resolve) => {
    const tempList = []
    let lastTweetTime = data.tweetsInfo.lastTweetTime
    let next = null
    do {
      const res = await getCommunityTweets({
        tweetsAppUid: data.tweetsAppUid,
        authToken: data.authToken,
        variables: {
          count: 50,
          communityId: data.communityId,
          withCommunity: true,
          cursor: next,
        },
        features: {
          rweb_lists_timeline_redesign_enabled: true,
          responsive_web_graphql_exclude_directive_enabled: true,
          verified_phone_label_enabled: false,
          creator_subscriptions_tweet_preview_api_enabled: true,
          responsive_web_graphql_timeline_navigation_enabled: true,
          responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
          tweetypie_unmention_optimization_enabled: true,
          responsive_web_edit_tweet_api_enabled: true,
          graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
          view_counts_everywhere_api_enabled: true,
          longform_notetweets_consumption_enabled: true,
          responsive_web_twitter_article_tweet_consumption_enabled: false,
          tweet_awards_web_tipping_enabled: false,
          freedom_of_speech_not_reach_fetch_enabled: true,
          standardized_nudges_misinfo: true,
          tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
          longform_notetweets_rich_text_read_enabled: true,
          longform_notetweets_inline_media_enabled: true,
          responsive_web_media_download_video_enabled: false,
          responsive_web_enhance_cards_enabled: false,
        },
      })
      const resData = res?.data?.communityResults?.result?.community_timeline
      const instructions = resData?.timeline?.instructions
      const entries = instructions?.find((_) => _.type === 'TimelineAddEntries')
      const list = entries?.entries || []
      for (let i = 0; i < list.length; i++) {
        const _ = list[i]
        let likeUsers = [],
          replyUsers = []
        if (_.entryId.includes('tweet-')) {
          const tweetData =
            _?.content?.itemContent?.tweet_results?.result.tweet || {}
          const time = tweetData.legacy.created_at
          if (new Date(time).getTime() <= data.tweetsInfo.lastTweetTime) {
            next = null
            break
          }
          if (new Date(time).getTime() > lastTweetTime) {
            lastTweetTime = new Date(time).getTime()
          }
          data.tweetId = tweetData.rest_id
          if (tweetData.legacy.favorite_count > 0) {
            likeUsers = await getCommunityLikes(data)
            likeUsers = likeUsers.map((_) => {
              _.lastActiveTime = new Date(time).getTime()
              return _
            })
          }
          if (tweetData.legacy.reply_count > 0) {
            replyUsers = await getCommunityComments(data)
          }
          const author = tweetData.core.user_results.result.legacy
          tempList.push({
            tweetId: data.tweetId,
            authorName: author?.name || 'no_name',
            authorHandleName: author?.screen_name || 'no_handle_name',
            createTime: new Date(time).getTime(),
            likeUsers,
            replyUsers,
          })
        }
        if (_.entryId.includes('cursor-bottom-')) {
          next = _.content.value
        }
        if (!list.find((_) => _.entryId.includes('tweet-'))) next = null
      }
    } while (next)
    resolve({
      list: tempList,
      lastTweetTime,
    })
  })
}

async function getCommunityLikes(data) {
  const tempList = []
  let next = null
  do {
    const url = `https://twitter.com/i/api/graphql/${data.favoritersUid}/Favoriters`
    const query = `?variables=${escapeParams({
      tweetId: data.tweetId,
      count: 50,
      includePromotedContent: true,
      cursor: next,
    })}&features=${escapeParams({
      rweb_lists_timeline_redesign_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      tweetypie_unmention_optimization_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: false,
      tweet_awards_web_tipping_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_media_download_video_enabled: false,
      responsive_web_enhance_cards_enabled: false,
    })}`
    await sleep(300)
    const res = await fetch(url + query, {
      headers: {
        Authorization: `Bearer ${data.authToken}`,
        'X-Csrf-Token': getCookie('ct0'),
      },
    })
    const resJsonData = await res.json()
    const resData = resJsonData?.data?.favoriters_timeline
    const instructions = resData?.timeline?.instructions
    const entries = instructions?.find((_) => _.type === 'TimelineAddEntries')
    const list = entries?.entries || []
    for (let i = 0; i < list.length; i++) {
      const _ = list[i]
      next = ''
      if (_.entryId.includes('cursor-bottom-')) {
        next = _.content.value
      }
      if (_.entryId.includes('user-')) {
        const userData =
          _?.content?.itemContent?.user_results?.result?.legacy || {}
        tempList.push({
          name: userData?.name || 'no_name',
          handleName: userData?.screen_name || 'no_handle_name',
        })
      }
      if (!list.find((_) => _.entryId.includes('user-'))) next = ''
    }
  } while (next)
  return tempList
}

async function getCommunityComments(data) {
  const tempList = []
  let next = null
  do {
    const url = `https://twitter.com/i/api/graphql/${data.tweertDetailUid}/TweetDetail`
    const query = `?variables=${escapeParams({
      focalTweetId: data.tweetId,
      cursor: next,
      referrer: 'tweet',
      with_rux_injections: false,
      includePromotedContent: true,
      withCommunity: true,
      withQuickPromoteEligibilityTweetFields: true,
      withBirdwatchNotes: true,
      withVoice: true,
      withV2Timeline: true,
    })}&features=${escapeParams({
      rweb_lists_timeline_redesign_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      tweetypie_unmention_optimization_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: false,
      tweet_awards_web_tipping_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_media_download_video_enabled: false,
      responsive_web_enhance_cards_enabled: false,
    })}&fieldToggles=${escapeParams({ withArticleRichContentState: false })}`
    await sleep(300)
    const res = await fetch(url + query, {
      headers: {
        Authorization: `Bearer ${data.authToken}`,
        'X-Csrf-Token': getCookie('ct0'),
      },
    })
    const resJsonData = await res.json()
    const resData = resJsonData?.data?.threaded_conversation_with_injections_v2
    const instructions = resData?.instructions
    const entries = instructions?.find((_) => _.type === 'TimelineAddEntries')
    const list = entries?.entries || []
    for (let i = 0; i < list.length; i++) {
      const _ = list[i]
      next = ''
      if (
        _.entryId.includes('cursor-bottom-') ||
        _.entryId.includes('cursor-showmorethreads-')
      ) {
        next = _.content.itemContent.value
      }
      if (_.entryId.includes('conversationthread-')) {
        const items = _.content.items.filter((_) =>
          _.entryId.includes('conversationthread-')
        )
        items.forEach((_) => {
          const commenterData =
            _.item?.itemContent?.tweet_results?.result?.tweet?.core
              ?.user_results?.result?.legacy
          const commentData =
            _.item?.itemContent?.tweet_results?.result?.tweet?.legacy
          if (commenterData && commentData)
            tempList.push({
              name: commenterData?.name || 'no_name',
              handleName: commenterData?.screen_name || 'no_handle_name',
              lastActiveTime: new Date(commentData.created_at).getTime(),
            })
        })
      }
      if (!list.find((_) => _.entryId.includes('conversationthread-')))
        next = ''
    }
  } while (next)
  return tempList
}

async function getCommunityTweets(data) {
  const url = `https://twitter.com/i/api/graphql/${data.tweetsAppUid}/CommunityTweetsTimeline`
  const query = `?variables=${escapeParams(
    data.variables
  )}&features=${escapeParams(data.features)}`
  await sleep(500)
  const res = await fetch(url + query, {
    headers: {
      Authorization: `Bearer ${data.authToken}`,
      'X-Csrf-Token': getCookie('ct0'),
    },
  })
  const resData = await res.json()
  return resData
}
