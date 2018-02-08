const Rbtmq = require('../../lib')
const exchangeName = 'test-pubsub-topic-exchange'

async function publishe () {
    const mq = new Rbtmq()
    await mq.boot({
        exchanges: [
            {
                name: exchangeName,
                type: 'topic',
                options: {
                    autoDelete: true
                },
            }
        ],
    })

    await mq.pub(exchangeName, 'obj1.event.name1', {obj: 1, key: 'value1', date: new Date()})
    await mq.pub(exchangeName, 'obj2.event.name2', {obj:2, key: 'value2', date: new Date()})

    await new Promise(resolve => setTimeout(resolve, 100))
    await mq.connection.close()
}

publishe()
    .then(null, err => console.error(new Date(), err))
