parseParams = () => {
  let s = decodeURI(location.search.substring(1))
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
  return s == '' ? {} : JSON.parse('{"' + s + '"}')
}

let v = parseParams().v || '5qap5aO4i9A'
let stream = document.querySelector('#stream')
let ltlchat = document.querySelector('#livetl-chat')
let chat = document.querySelector('#chat')
let leftPanel = document.querySelector('#leftPanel')
let bottomRightPanel = document.querySelector('#bottomRightPanel')
let topRightPanel = document.querySelector('#topRightPanel')
let start = () => {
  stream.style.display = 'none'
  ltlchat.style.display = 'none'
  chat.style.display = 'none'
  leftPanel.style.backgroundColor = 'var(--accent)'
  bottomRightPanel.style.backgroundColor = 'var(--accent)'
  topRightPanel.style.backgroundColor = 'var(--accent)'
}
let stop = () => {
  stream.style.display = 'block'
  ltlchat.style.display = 'block'
  chat.style.display = 'block'
  leftPanel.style.backgroundColor = 'black'
  bottomRightPanel.style.backgroundColor = 'black'
  topRightPanel.style.backgroundColor = 'black'
}
$('#leftPanel').resizable({
  handles: {
    'e': '#handleV'
  }, start: start, stop: stop
})
$('#topRightPanel').resizable({
  handles: {
    's': '#handleH'
  }, start: start, stop: stop
})
chat.src = `https://kentonishi.github.io/LiveTL/embed?v=${v}&embed_domain=${document.domain}`
stream.src = `https://www.youtube.com/embed/${v}?autoplay=1`
ltlchat.src = `${chat.src}&useLiveTL=1`
