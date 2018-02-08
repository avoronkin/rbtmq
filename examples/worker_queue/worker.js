const Rbtmq = require('../../lib')
const exchangeName = 'test-worker-exchange'
// node ./examples/worker_queue/worker.js cmnd.*

async function subscribe (pattern = '#') {
    const queueName = ['test-worker-queue', pattern].join('.')
    const mq = new Rbtmq()

    await mq.boot({
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

    await mq.sub(queueName, function (msg) {
        setTimeout(() => {
            console.log('msg', msg.body, new Date())
            msg.ack()
        }, 1000)
    }, {
        prefetch: 1
    })
}


const args = process.argv.slice(2)
const [pattern] = args

subscribe(pattern)
    .then(null, err => console.error(new Date(), err))
