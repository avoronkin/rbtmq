const rbtmq = require('../../lib')

async function publisher () {
    const mq = await rbtmq({
        exchanges: [
            {
                name: 'test-pubsub-exchange',
                type: 'fanout',
                options: {
                    autoDelete: true
                },
            }
        ]
    })

    await mq.publish('test-pubsub-exchange', '', {key: 'value1', date: new Date()})
    await mq.publish('test-pubsub-exchange', '', {key: 'value2', date: new Date()})

    await new Promise(resolve => setTimeout(resolve, 100))
    await mq.connection.close()
}

publisher()
    .then(null, err => console.error(new Date(), err))
