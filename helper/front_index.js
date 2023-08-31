function getCookie(cname) {
  var name = cname + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim()
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length)
  }
  return ''
}

function escapeParams(params) {
  return `${encodeURIComponent(JSON.stringify(params))}`
}

function requestBackground(action, data, cbk) {
  chrome.runtime.sendMessage({ action, data }, cbk)
}

function downloadCsv(data) {
  var csvData = data.header + '\n' + data.data
  var blob = new Blob(['\ufeff' + csvData], { type: 'text/csv' })
  var url = URL.createObjectURL(blob)
  var downloadLink = document.createElement('a')
  downloadLink.href = url
  downloadLink.download = `${data.name}.csv`
  downloadLink.click()
  URL.revokeObjectURL(url)
}
