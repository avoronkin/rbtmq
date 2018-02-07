const Rbtmq = require('../../lib')

async function publisher () {
    const mq = new Rbtmq()
    await mq.bootstrap({
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

    await mq.exchange('test-pubsub-exchange')
        .publish('', {key: 'value1', date: new Date()})
        .publish('', {key: 'value2', date: new Date()})

    await new Promise(resolve => setTimeout(resolve, 100))
    await mq.connection.close()
}

publisher()
    .then(null, err => console.error(new Date(), err))
