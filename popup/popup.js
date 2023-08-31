function initCommunityId() {
  const localCommunityId = window.localStorage.getItem('localCommunityId')
  if (localCommunityId) {
    const submitBtn = document.querySelector('.submit')
    const communityInput = document.querySelector('.community_id')
    submitBtn.innerText = '编辑'
    communityInput.value = localCommunityId
    communityInput.disabled = true
    requestBackground('updateCommunityId', localCommunityId)
  }
}

window.onload = () => {
  initCommunityId()
  const submitBtn = document.querySelector('.submit')
  const communityInput = document.querySelector('.community_id')
  submitBtn.addEventListener('click', () => {
    if (submitBtn.innerText === '保存') {
      const value = communityInput.value
      if (/^[0-9]*$/.test(value)) {
        submitBtn.innerText = '编辑'
        communityInput.disabled = true
        communityInput.value = value
        window.localStorage.setItem('localCommunityId', value)
        requestBackground('updateCommunityId', value)
      }
    } else {
      submitBtn.innerText = '保存'
      communityInput.disabled = false
    }
  })
}
