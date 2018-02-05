const amqp = require('amqplib')
const Promise = require('bluebird')

module.exports = class Rbtmq {
    constructor () {
        this.exchanges = {}
        this.currentExchange
        this.queues = {}
        this.currentQueue
        this.context
        this.connection
        this.channel

        return enchainProxifier(this)
    }

    async connect (url, options) {
        this.connection = await amqp.connect(url, options)

        return this.connection
    }

    async createChannel () {
        this.channel = await this.connection.createChannel()

        return this.channel
    }

    async exchange (exchange, type, options) {
        if (!this.exchanges[exchange]) {
            await this.channel.assertExchange(exchange, type, options)

            this.exchanges[exchange] = true
        }

        this.currentExchange = exchange
        this.context = 'exchange'
    }

    async queue (queue, options) {
        if (!this.queues[queue]) {
            this.queues[queue] = await this.channel.assertQueue(queue, options)
        }

        this.currentQueue = this.queues[queue].queue
        this.context = 'queue'

        return this.queues[queue]
    }

    async bind (pattern = '') {
        await this.channel.bindQueue(this.currentQueue, this.currentExchange, pattern)
    }

    async publish (routingKey, content, options) {
        return this.channel.publish(this.currentExchange, routingKey, content, options)
    }

    async consume (handler, options) {
        return this.channel.consume(this.currentQueue, handler, options)
    }

    async bootstrap ({exchanges}) {
        await Promise.map(exchanges || [], async exchange => {

            await this.exchange(exchange.name, exchange.type, exchange.options)

            await Promise.map(exchange.queues || [], async queue => {

                await this.queue(queue.name, queue.options)
                await this.bind(queue.pattern)
            })
        })
    }
}

const enchainProxifier = (target, promise = Promise.resolve()) => {
    return new Proxy(target, {
        get (target, propName) {
            if (propName === 'promise') {
                return promise
            } else if (propName === 'then') {
                return (...args) => promise.then(...args)
            }
            if (target[propName] instanceof Function) {
                return (...args) => enchainProxifier(target, promise.then(() => target[propName](...args)))
            }
            return target[propName]
        }
    })
}
