const Rbtmq = require('../../lib')
const exchangeName = 'test-pubsub-topic-exchange'

async function publishe () {
    const mq = new Rbtmq()
    await mq.bootstrap({
        exchanges: [
            {
                name: exchangeName,
                type: 'topic',
                options: {
                    autoDelete: true
                },
            }
        ]
    })

    await mq.exchange(exchangeName)
        .publish('obj1.event.name1', {obj: 1, key: 'value1', date: new Date()})
        .publish('obj2.event.name2', {obj:2, key: 'value2', date: new Date()})

    await new Promise(resolve => setTimeout(resolve, 100))
    await mq.connection.close()
}

publishe()
    .then(null, err => console.error(new Date(), err))
