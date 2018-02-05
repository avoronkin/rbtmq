const rbtmq = require('../../lib')

async function server () {
    const exchangeName = 'test-req-res-exchange'
    const reqQueueName = 'test-req-queue'

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
                        name: reqQueueName,
                        pattern: 'resource.create.request',
                        options: {
                            durable: true
                        }
                    }
                ]
            }
        ]
    })


    await mq.consume(reqQueueName, function (msg) {
        this.ch.ack(msg)
        console.log('req', msg.data, new Date())
        mq.publish(exchangeName, 'resource.create.responce', {responce: true, obj: 1, key: 'value1', date: new Date()}, {
            persistent: true
        })
    })
}

server()
    .then(null, err => console.error(new Date(), err))
