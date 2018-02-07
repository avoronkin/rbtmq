const Rbtmq = require('../../lib')
const exchangeName = 'test-req-res-exchange'
const resQueueName = 'test-res-queue'
// node ./examples/req_res/client.js

async function client () {
    const mq = new Rbtmq()

    await mq.bootstrap({
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


    await mq.queue(resQueueName).consume(function (msg) {
        console.log('res', msg.body, new Date())
        msg.ack()
    })

    await mq.exchange(exchangeName).publish('resource.create.request', {obj: 1, key: 'value1', date: new Date()}, {
        persistent: true
    })
}

client()
    .then(null, err => console.error(new Date(), err))
