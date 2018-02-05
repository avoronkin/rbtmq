const rbtmq = require('../lib')
const assert = require('assert')
const sinon = require('sinon')

describe('rbtmq', () => {
    let mq

    beforeEach(async () => {
        mq = await rbtmq({
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
        })
    })

    after(async () => {
        await mq.connection.close()
    })

    it('consume message', async () => {
        const data = {test: 'data'}

        const spy = sinon.spy(function (msg) {
            this.ch.ack(msg, false)
        })

        await mq.consume('test-queue', spy)
        await mq.publish('test-exchange', 'path', data)
        await new Promise(resolve => setTimeout(resolve, 50))

        assert.equal(spy.calledOnce, true)
        assert.deepEqual(spy.firstCall.args[0].data, data)
    })
})
