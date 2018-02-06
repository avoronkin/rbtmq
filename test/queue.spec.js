const Rbtmq = require('../lib')
const assert = require('assert')
const sinon = require('sinon')

describe('queue', () => {
    let mq
    let channel

    beforeEach(async () => {
        mq = new Rbtmq()
        await mq.bootstrap({
            exchanges: [
                {
                    name: 'test-exchange',
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
    })

    afterEach(async () => {
        if (mq.connection) {
            await mq.connection.close()
        }
    })
    
    it('set currentQueue', async () => {
        await mq.queue('test-queue1')
        assert.equal(mq.currentQueue, 'test-queue1')
        await mq.queue('test-queue2')
        assert.equal(mq.currentQueue, 'test-queue2')
    })

    it('set context', async () => {
        await mq.exchange('test-exchange')
        assert.equal(mq.context, 'exchange')
        await mq.queue('test-queue2')
        assert.equal(mq.context, 'queue')
    })

    it('call channel.assertQueue if queue does not exists', async () => {
        assert(!channel.assertQueue.called)
        await mq.queue('test-queue2')
        assert(!channel.assertQueue.called)
        await mq.queue('test-queue3')
        assert(channel.assertQueue.calledOnce)
        assert.deepEqual(mq.queues['test-queue3'], {queue: 'test-queue3'})
    })
})
