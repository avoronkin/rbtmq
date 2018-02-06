const Rbtmq = require('../lib')
const assert = require('assert')
const sinon = require('sinon')

describe('exchange', () => {
    let mq
    let channel

    beforeEach(async () => {
        mq = new Rbtmq()
        await mq.bootstrap({
            exchanges: [
                {
                    name: 'test-exchange1',
                    type: 'topic',
                    options: {
                        autoDelete: true
                    },
                },
                {
                    name: 'test-exchange2',
                    type: 'topic',
                    options: {
                        autoDelete: true
                    },
                }
            ],
            queues: [
                {
                    name: 'test-queue1',
                    options: {
                        autoDelete: true
                    }
                },
                {
                    name: 'test-queue2',
                    options: {
                        autoDelete: true
                    }
                }
            ]
        })

        channel = await mq.channel()
        sinon.stub(channel, 'assertQueue').resolves({queue: 'test-queue3'})
        sinon.stub(channel, 'assertExchange').resolves()
    })

    afterEach(async () => {
        if (mq.connection) {
            await mq.connection.close()
        }
    })

    it('set currentExchange', async () => {
        await mq.exchange('test-exchange1')
        assert.equal(mq.currentExchange, 'test-exchange1')
        await mq.exchange('test-exchange2')
        assert.equal(mq.currentExchange, 'test-exchange2')
    })

    it('set context', async () => {
        await mq.queue('test-queue2')
        assert.equal(mq.context, 'queue')
        await mq.exchange('test-exchange1')
        assert.equal(mq.context, 'exchange')
    })

    it('call channel.assertExchange if exchange does not exists', async () => {
        assert(!channel.assertExchange.called)
        await mq.exchange('test-exchange2')
        assert(!channel.assertExchange.called)
        await mq.exchange('test-exchange3')
        assert(channel.assertExchange.calledOnce)
    })
})
