const Rbtmq = require('../../lib')
const queueName = ['test-pubsub-queue', Date.now()].join('.')

async function subscriber () {
    const mq = new Rbtmq()

    await mq.bootstrap({
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

    await mq.exchange(queueName).consume(function (msg) {
        console.log('msg', msg.body, new Date())
    }, {
        noAck: true
    })
}

subscriber()
    .then(null, err => console.error(new Date(), err))
