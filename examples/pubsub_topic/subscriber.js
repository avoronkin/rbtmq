const Rbtmq = require('../../lib')
const exchangeName = 'test-pubsub-topic-exchange'
const queueName = ['test-pubsub-topic-queue', Date.now()].join('.')

// node ./examples/pubsub_topic/subscriber.js *.event.*
// node ./examples/pubsub_topic/subscriber.js obj1.#

async function subscribe (pattern = '#') {
    const mq = new Rbtmq()
    await mq.bootstrap({
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

    await mq.exchange(queueName).consume(function (msg) {
        console.log('msg', msg.body, new Date())
    }, {
        noAck: true
    })
}


const args = process.argv.slice(2)
const [pattern] = args

subscribe(pattern)
    .then(null, err => console.error(new Date(), err))
