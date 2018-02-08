const amqp = require('amqplib')
const Promise = require('bluebird')

module.exports = class Rbtmq {
    constructor () {
        this.exchanges = {}
        this.queues = {}
        this.channels = {}
        this.connection

        return enchainProxifier(this)
    }

    async boot ({
        connection = {},
        exchanges = [],
        queues = [],
        bindings = [],
    }) {
        if(!this.connection) {
            this.connection = await amqp.connect(connection.url, connection.options)
        }

        const channel = await this.connection.createChannel()

        await Promise.mapSeries(exchanges || [], async exchange => {

            await channel.assertExchange(exchange.name, exchange.type, exchange.options)

            await Promise.mapSeries(exchange.queues || [], async queue => {
                await channel.assertQueue(queue.name, queue.options)
                await channel.bindQueue(queue.name, exchange.name, queue.pattern)
            })
        })

        await Promise.mapSeries(queues || [], async queue => {
            await channel.assertQueue(queue.name, queue.options)
            if (queue.bindings && queue.bindings.length) {
                await Promise.mapSeries(queue.bindings, async bind => {
                    await channel.bindQueue(queue.name, bind.exchange, bind.pattern)
                })
            }
        })

        await Promise.mapSeries(bindings || [], async bind => {
            await channel.bindQueue(bind.queue, bind.exchange,  bind.pattern)
        })
    }

    async sub (queue, fn, options = {}) {
        const consumerName = [queue, JSON.stringify(options)].join(':')

        if (!this.channels[consumerName]) {
            this.channels[consumerName] = await this.connection.createChannel()
        }

        const channel = this.channels[consumerName]

        if (options.prefetch) {
            await channel.prefetch(options.prefetch)
        }

        return channel.consume(queue, (msg) => {
            if (msg.properties && msg.properties.contentType === 'application/json') {
                msg.body = JSON.parse(msg.content.toString())
            }

            if (!options.noAck) {
                msg.ack = channel.ack.bind(channel, msg)
                msg.nack = channel.nack.bind(channel, msg)
            }

            fn.call(this, msg)
        }, options)
    }

    async pub (exchange, routingKey, content, options = {}) {
        const publisherName = [exchange, routingKey, JSON.stringify(options)].join(':')

        if (!this.channels[publisherName]) {
            this.channels[publisherName] = await this.connection.createChannel()
        }

        const channel = this.channels[publisherName]

        const isBuffer = Buffer.isBuffer(content)
        options.contentType = isBuffer ? 'application/octet-stream' : 'application/json'
        const buffer = isBuffer ? content : Buffer.from(JSON.stringify(content))

        return channel.publish(exchange, routingKey, buffer, options)
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
