const rbtmq = require('../../lib')

// node ./examples/pubsub_topic/subscriber.js *.event.*
// node ./examples/pubsub_topic/subscriber.js obj1.#

async function subscribe (pattern = '#') {
    const exchangeName = 'test-worker-exchange'
    const queueName = ['test-worker-queue', pattern].join('.')

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
                        prefetch: 1,
                        options: {
                            autoDelete: true
                        }
                    }
                ]
            }
        ]
    })

    await mq.consume(queueName, function (msg) {
        setTimeout(() => {
            console.log('msg', msg.data, new Date())
            this.ch.ack(msg)
        }, 1000)
    })
}


const args = process.argv.slice(2)
const [pattern] = args

subscribe(pattern)
    .then(null, err => console.error(new Date(), err))
