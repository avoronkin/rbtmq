const rbtmq = require('../../lib')

async function subscriber () {
    const queueName = ['test-pubsub-queue', Date.now()].join('.')

    const mq = await rbtmq({
        exchanges: [
            {
                name: 'test-pubsub-exchange',
                type: 'fanout',
                options: {
                    autoDelete: true
                },
                queues: [
                    {
                        name: queueName,
                        options: {
                            autoDelete: true
                        }
                    }
                ]
            }
        ]
    })

    await mq.consume(queueName, function (msg) {
        console.log('msg', msg.data, new Date())
    }, {
        noAck: true
    })
}

subscriber()
    .then(null, err => console.error(new Date(), err))
