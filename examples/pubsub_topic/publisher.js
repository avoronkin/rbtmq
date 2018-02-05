const rbtmq = require('../../lib')

async function publishe () {
    const exchangeName = 'test-pubsub-topic-exchange'

    const mq = await rbtmq({
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

    await mq.publish(exchangeName, 'obj1.event.name1', {obj: 1, key: 'value1', date: new Date()})
    await mq.publish(exchangeName, 'obj2.event.name2', {obj:2, key: 'value2', date: new Date()})

    await new Promise(resolve => setTimeout(resolve, 100))
    await mq.connection.close()
}

publishe()
    .then(null, err => console.error(new Date(), err))
