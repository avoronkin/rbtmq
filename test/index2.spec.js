const Rbtmq = require('../lib2')
const assert = require('assert')
const sinon = require('sinon')
const config = {
    exchanges: [
        {
            name: 'test-exchange',
            type: 'topic',
            options: {
                autoDelete: true
            },
            queues: [
                {
                    name: 'test-queue',
                    pattern: 'path',
                    prefetch: 10,
                    options: {
                        autoDelete: true
                    }
                }
            ]
        }
    ]
}

describe('rbtmq', () => {
    let mq

    beforeEach(async () => {
        mq = new Rbtmq()
    })

    after(async () => {
        await mq.connection.close()
    })

    it('consume message', async () => {
        await mq.connect().createChannel().bootstrap(config)
        const data = {test: 'data'}

        const spy = sinon.spy(function (msg) {
            mq.channel.ack(msg, false)
        })

        await mq.queue('test-queue').consume(spy)
        await mq.exchange('test-exchange').publish('path', Buffer.from(JSON.stringify(data)))
        await new Promise(resolve => setTimeout(resolve, 50))

        assert.equal(spy.calledOnce, true)
        assert.deepEqual(JSON.parse(spy.firstCall.args[0].content.toString()), data)
    })
})
