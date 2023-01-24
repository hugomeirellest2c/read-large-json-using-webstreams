const API_URL = 'http://localhost:3000'

async function consumeAPI(signal) {
  const res = await fetch(API_URL, {
    signal
  })
  let counter = 0
  const reader = res.body
    .pipeThrough(new TextDecoderStream())
    // .pipeThrough(parseNDJSON())
    .pipeTo(new WritableStream({
      write(chunk) {
        console.log(++counter, 'chunk', chunk)
      }
    }))

  return reader
}

// function parseNDJSON() {
//   let ndjsonBuffer = ''
//   return new TransformStream({
//     transform(chunk, controller) {
//       ndjsonBuffer += chunk
//       const items = ndjsonBuffer.split('\n')
//       items.slice(0, -1)
//         .forEach(item => controller.enqueue(JSON.parse(item)))

//       ndjsonBuffer = items[items.length - 1]
//     },
//     flush(controller) {
//       if(!ndjsonBuffer) return
//       controller.enqueue(JSON.parse(ndjsonBuffer))
//     }
//   })
// }

const abortController = new AbortController()
await consumeAPI(abortController.signal)
