const Rbtmq = require('../lib')
const assert = require('assert')
const sinon = require('sinon')

describe.only('bootstrap', () => {
    let mq

    beforeEach(async () => {
        mq = new Rbtmq()
    })

    afterEach(async () => {
        if (mq.connection) {
            await mq.connection.close()
        }
    })

    describe('exchanges block', () => {

        it('call channel.assertExchange for each item', async () => {
            const channel = await mq.channel()
            sinon.stub(channel, 'assertExchange').resolves()

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
                        type: 'fanout',
                        options: {
                            autoDelete: true
                        },
                    }
                ]
            })

            assert(channel.assertExchange.calledTwice)
            assert.deepEqual(channel.assertExchange.firstCall.args, ['test-exchange1', 'topic', {autoDelete: true}])
            assert.deepEqual(channel.assertExchange.secondCall.args, ['test-exchange2', 'fanout', {autoDelete: true}])
        })

        it('call channel.assertQueue for items in exchange.queues', async () => {
            const channel = await mq.channel()
            sinon.stub(channel, 'assertExchange').resolves()
            sinon.stub(channel, 'assertQueue')
                .onFirstCall().resolves({queue: 'test-queue1'})
                .onSecondCall().resolves({queue: 'test-queue2'})
            sinon.stub(channel, 'bindQueue').resolves()

            await mq.bootstrap({
                exchanges: [
                    {
                        name: 'test-exchange1',
                        type: 'topic',
                        options: {
                            autoDelete: true
                        },
                        queues: [
                            {
                                name: 'test-queue1',
                                options: {
                                    autoDelete: true
                                }
                            }
                        ]
                    },
                    {
                        name: 'test-exchange2',
                        type: 'fanout',
                        options: {
                            autoDelete: true,
                        },
                        queues: [
                            {
                                name: 'test-queue2',
                                options: {
                                    autoDelete: true
                                }
                            }
                        ]
                    },
                    {
                        name: 'test-exchange3',
                        type: 'fanout',
                        options: {
                            autoDelete: true,
                        },
                    }
                ]
            })

            assert(channel.assertQueue.calledTwice)
            assert.deepEqual(channel.assertQueue.firstCall.args, ['test-queue1', {autoDelete: true}])
            assert.deepEqual(channel.assertQueue.secondCall.args, ['test-queue2', {autoDelete: true}])

            assert(channel.bindQueue.calledTwice)
            assert.deepEqual(channel.bindQueue.firstCall.args, ['test-queue1', 'test-exchange1', ''])
            assert.deepEqual(channel.bindQueue.secondCall.args, ['test-queue2', 'test-exchange2', ''])
        })

    })


    describe('queues block', () => {
        it('call channel.assertQueue for each item', async () => {
            const channel = await mq.channel()
            sinon.stub(channel, 'assertExchange').resolves()
            sinon.stub(channel, 'assertQueue')
                .onFirstCall().resolves({queue: 'test-queue1'})
                .onSecondCall().resolves({queue: 'test-queue2'})
            sinon.stub(channel, 'bindQueue').resolves()

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
                        type: 'fanout',
                        options: {
                            autoDelete: true,
                        },
                    },
                    {
                        name: 'test-exchange3',
                        type: 'fanout',
                        options: {
                            autoDelete: true,
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
                        },
                        bindings: [
                            {
                                pattern: 'test',
                                exchange: 'test-exchange2'
                            }
                        ]
                    }
                ]
            })

            assert(channel.assertQueue.calledTwice)
            assert.deepEqual(channel.assertQueue.firstCall.args, ['test-queue1', {autoDelete: true}])
            assert.deepEqual(channel.assertQueue.secondCall.args, ['test-queue2', {autoDelete: true}])

            assert(channel.bindQueue.calledOnce)
            assert.deepEqual(channel.bindQueue.firstCall.args, ['test-queue2', 'test-exchange2', 'test'])
        })

    })


    describe('bindings block', () => {})

})
