const rbtmq = require('../../lib')

// node ./examples/pubsub_topic/subscriber.js *.event.*
// node ./examples/pubsub_topic/subscriber.js obj1.#

async function subscribe (pattern = '#') {
    const exchangeName = 'test-pubsub-topic-exchange'
    const queueName = ['test-pubsub-topic-queue', Date.now()].join('.')

    const mq = await rbtmq({
        exchanges: [
            {
                name: exchangeName,
                type: 'topic',
                options: {
                    autoDelete: true
                },
                queues: [
                    {
                        name: queueName,
                        pattern,
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


const args = process.argv.slice(2)
const [pattern] = args

subscribe(pattern)
    .then(null, err => console.error(new Date(), err))
