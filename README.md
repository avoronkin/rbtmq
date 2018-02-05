```js
const mq = await rbtmk({
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
                    prefetch: 5,
                    options: {
                        autoDelete: true
                    }
                }
            ]
        }
    ]
})

await mq.consume('test-queue', function (msg) {
    console.log(msg.data)
    this.ch.ack(msg, false)
})

await mq.publish('test-exchange', 'path', {test: 'value'})

```
