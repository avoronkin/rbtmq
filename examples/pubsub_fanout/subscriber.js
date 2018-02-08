const Rbtmq = require('../../lib')
const queueName = ['test-pubsub-queue', Date.now()].join('.')

async function subscriber () {
    const mq = new Rbtmq()

    await mq.boot({
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
        ],
        consumers: [
            {
                name: 'consumer1',
                queue: queueName,
                options: {
                    noAsk: true
                }
            },
        ]
    })

    await mq.sub(queueName, function (msg) {
        console.log('msg', msg.body, new Date())
    }, {
        noAsk: true
    })
}

subscriber()
    .then(null, err => console.error(new Date(), err))
