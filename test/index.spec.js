const Rbtmq = require('../lib')
const assert = require('assert')
const sinon = require('sinon')

describe('rbtmq', () => {
    let mq

    beforeEach(async () => {
        mq = new Rbtmq()
    })

    afterEach(async () => {
        if (mq.connection) {
            await mq.connection.close()
        }
    })

    it('consume message', async () => {
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
                            options: {
                                autoDelete: true
                            }
                        }
                    ]
                }
            ]
        }

        await mq.bootstrap(config)
        const data = {test: 'data'}

        const spy = sinon.spy(function (msg) {
            assert.deepEqual(msg.body, data)
            msg.ack(false)
        })

        await mq.queue('test-queue').consume(spy)
        await mq.exchange('test-exchange').publish('path', data)
        await new Promise(resolve => setTimeout(resolve, 50))

        assert.equal(spy.calledOnce, true)
    })
})
