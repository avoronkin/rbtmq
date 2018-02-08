```js
const mq = new Rbtmq()

const config = {
    exchanges: [
        {
            name: 'test-exchange',
            type: 'topic',
            options: {
                autoDelete: true
            },
            queues: [
                {
                    name: 'test-queue',
                    pattern: 'path',
                    options: {
                        autoDelete: true
                    }
                }
            ]
        }
    ]
}
const data = {test: 'data'}
const spy = sinon.spy(function (msg) {
    assert.deepEqual(msg.body, data)
    msg.ack(false)
})

await mq.boot(config)

await mq.sub('test-queue', spy)
await mq.pub('test-exchange', 'path', data)

```
