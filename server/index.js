import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { Readable, Transform } from 'node:stream'
import { WritableStream, TransformStream } from 'node:stream/web'
import { setTimeout } from 'node:timers/promises'
import csvtojson from 'csvtojson' 
const PORT = 3000

createServer(async (req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
  }

  if(req.method === 'OPTIONS') {
    res.writeHead(204, headers)
    res.end()
    return
  }
  let items = 0
  req.once('close', _ => console.log('Connection was closed!', items))
  Readable.toWeb(createReadStream('./animeflv.csv'))
  .pipeThrough(Transform.toWeb(csvtojson()))
  .pipeThrough(new TransformStream({
    transform(chunk, controller) {
      // console.log('chunk', Buffer.from(chunk).toString())
      const data = JSON.parse(Buffer.from(chunk)),
      mappedData = {
        title: data.title,
        description: data.description,
        url_anime: data.url_anime
      }
      controller.enqueue(JSON.stringify(mappedData).concat('\n'))
    }
  }))
  .pipeTo(new WritableStream({
    async write(chunk) {
      await setTimeout(1000)
      res.write(chunk)
      items++
    },
    close() {
      res.end()
    }
  }))

  res.writeHead(200, headers)
})
.listen(PORT)
.on('listening', _ => console.log(`server is running at ${PORT}`))
