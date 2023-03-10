const API_URL = 'http://localhost:3000'

async function consumeAPI(signal) {
  const res = await fetch(API_URL, {
    signal
  })
  let counter = 0
  const reader = res.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(parseNDJSON())
    // .pipeTo(new WritableStream({
    //   write(chunk) {
    //     console.log(++counter, 'chunk', chunk)
    //   }
    // }))

  return reader
}

function appendToHTML(element) {
  return new WritableStream({
    write({ title, description, url_anime }) {
      const card = `
      <article>
        <div class="text">
          <h3>${title}</h3>
          <p>${description}</p>
          <a href="${url_anime}">Here's why</a>
        </div>
      </article>
      `
      element.innerHTML += card
    }
  })
}

function parseNDJSON() {
  let ndjsonBuffer = ''
  return new TransformStream({
    transform(chunk, controller) {
      ndjsonBuffer += chunk
      const items = ndjsonBuffer.split('\n')
      items.slice(0, -1)
        .forEach(item => controller.enqueue(JSON.parse(item)))

      ndjsonBuffer = items[items.length - 1]
    },
    flush(controller) {
      if(!ndjsonBuffer) return;
      controller.enqueue(JSON.parse(ndjsonBuffer))
    }
  })
}

const [
  start,
  stop,
  cards
] = ['start', 'stop', 'cards'].map(item => document.getElementById(item))

const abortController = new AbortController()
const readable = await consumeAPI(abortController.signal)
readable.pipeTo(appendToHTML(cards))
