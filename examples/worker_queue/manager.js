const Rbtmq = require('../../lib')
const exchangeName = 'test-worker-exchange'
// node ./examples/worker_queue/manager.js

async function manager () {
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
        ]
    })

    await mq.pub(exchangeName, 'cmnd.name1', {obj: 1, key: 'value1', date: new Date()}, {
        persistent: true
    })
    await mq.pub(exchangeName, 'cmnd.name2', {obj: 2, key: 'value2', date: new Date()}, {
        persistent: true
    })

    await new Promise(resolve => setTimeout(resolve, 100))
    await mq.connection.close()
}

manager()
    .then(null, err => console.error(new Date(), err))
