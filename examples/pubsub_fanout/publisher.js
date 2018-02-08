const Rbtmq = require('../../lib')

async function publisher () {
    const mq = new Rbtmq()
    await mq.boot({
        exchanges: [
            {
                name: 'test-pubsub-exchange',
                type: 'fanout',
                options: {
                    autoDelete: true
                },
            }
        ],
        publishers: [
            {
                name: 'publisher1',
                exchange: 'test-pubsub-exchange',
                routingKey: ''
            }
        ],
    })

    await mq.pub('test-pubsub-exchange', '', {key: 'value1', date: new Date()})
    await mq.pub('test-pubsub-exchange', '', {key: 'value2', date: new Date()})

    await new Promise(resolve => setTimeout(resolve, 100))
    await mq.connection.close()
}

publisher()
    .then(null, err => console.error(new Date(), err))
