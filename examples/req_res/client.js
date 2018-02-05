const rbtmq = require('../../lib')

async function client () {
    const exchangeName = 'test-req-res-exchange'
    const resQueueName = 'test-res-queue'

    const mq = await rbtmq({
        exchanges: [
            {
                name: exchangeName,
                type: 'topic',
                options: {
                    durable: true
                },
                queues: [
                    {
                        name: resQueueName,
                        pattern: 'resource.create.responce',
                        options: {
                            durable: true
                        }
                    }
                ]
            }
        ]
    })

    await mq.publish(exchangeName, 'resource.create.request', {obj: 1, key: 'value1', date: new Date()}, {
        persistent: true
    })

    await mq.consume(resQueueName, function (msg) {
        console.log('res', msg.data, new Date())
        this.ch.ack(msg)
    })
}

client()
    .then(null, err => console.error(new Date(), err))
