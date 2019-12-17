const config = require('config')
const Koa = require('koa')
const util = require('util')
const koaBody = require('koa-body')
const request = util.promisify(require('request'))

const { port } = config
const app = new Koa()

app.use(koaBody())
app.use(async (ctx) => {
  console.log(ctx.request.url)
  const { uri, method = 'GET', callback } = ctx.request.query
  if (!uri) {
    ctx.body = ''
    return
  }
  const response = await request({
    method,
    uri,
    json: true,
    gzip: true
  })
  if (!callback) {
    ctx.body = response.body
    return
  }
  let callbackOptions = {}
  if (typeof callback === 'string') {
    callbackOptions.uri = callback
    callbackOptions.method = 'POST'
    callbackOptions.body = response.body
    callbackOptions.json = true
  }
  if (typeof callback === 'object') callbackOptions = callback
  const callbackRes = await request(callbackOptions)
  ctx.status = callbackRes.statusCode
  ctx.body = ''
})

app.listen(port, '0.0.0.0')
