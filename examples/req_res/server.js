const Rbtmq = require('../../lib')
const exchangeName = 'test-req-res-exchange'
const reqQueueName = 'test-req-queue'
// node ./examples/req_res/server.js *.create.*

async function server () {
    const mq = new Rbtmq()

    await mq.boot({
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

    await mq.sub(reqQueueName, async function (msg) {
        msg.ack()
        console.log('req', msg.body, new Date())
        await mq.pub(exchangeName, 'resource.create.responce', {
            responce: true,
            obj: 1,
            key: 'value1',
            date: new Date()
        }, {
            persistent: true
        })
    })
}

server()
    .then(null, err => console.error(new Date(), err))
