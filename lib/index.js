const amqp = require('amqplib')
const Promise = require('bluebird')

module.exports = class Rbtmq {
    constructor () {
        this.currentExchange
        this.currentQueue
        this.currentChannel
        this.exchanges = {}
        this.queues = {}
        this.context
        this.connection

        return enchainProxifier(this)
    }

    async connect (url, options) {
        if(!this.connection) {
            this.connection = await amqp.connect(url, options)
        }

        return this.connection
    }

    async channel () {
        if (!this.currentChannel) {
            const connection = await this.connect()
            this.currentChannel = await connection.createChannel()
        }

        return this.currentChannel
    }

    async bootstrap ({connection = {}, exchanges = [], queues = [], bindings = []}) {
        if (!this.connection) {
            await this.connect(connection.url, connection.options)
        }

        await this.channel()

        await Promise.mapSeries(exchanges || [], async exchange => {

            await this.exchange(exchange.name, exchange.type, exchange.options)

            await Promise.mapSeries(exchange.queues || [], async queue => {
                await this.queue(queue.name, queue.options)
                await this.bind(queue.pattern)
            })
        })

        await Promise.mapSeries(queues || [], async queue => {
            await this.queue(queue.name, queue.options)
            if (queue.bindings && queue.bindings.length) {
                await Promise.mapSeries(queue.bindings, async bind => {
                    await this.bind(bind.pattern, bind.exchange)
                })
            }
        })

        await Promise.mapSeries(bindings || [], async bind => {
            await this.currentChannel.bindQueue(bind.queue, bind.exchange,  bind.pattern)
        })
    }

    async exchange (exchange, type, options) {
        if (!this.exchanges[exchange]) {
            await this.currentChannel.assertExchange(exchange, type, options)

            this.exchanges[exchange] = true
        }

        this.currentExchange = exchange
        this.context = 'exchange'
    }

    async queue (queue, options) {
        if (!this.queues[queue]) {
            this.queues[queue] = await this.currentChannel.assertQueue(queue, options)
        }

        this.currentQueue = this.queues[queue].queue
        this.context = 'queue'

        return this.queues[queue]
    }

    async bind (pattern = '', to) {
        if (this.context === 'queue') {
            await this.currentChannel.bindQueue(this.currentQueue, to || this.currentExchange, pattern)
        }
        // if (this.context === 'exchange') {
        //
        // }
    }

    async publish (routingKey, content, options = {}) {
        const isBuffer = Buffer.isBuffer(content)
        options.contentType = isBuffer ? 'application/octet-stream' : 'application/json'
        const buffer = isBuffer ? content : Buffer.from(JSON.stringify(content))

        return this.currentChannel.publish(this.currentExchange, routingKey, buffer, options)
    }

    async consume (handler, options = {}) {
        return this.currentChannel.consume(this.currentQueue, (msg) => {
            if (msg.properties && msg.properties.contentType === 'application/json') {
                msg.body = JSON.parse(msg.content.toString())
            }

            if (!options.noAck) {
                msg.ack = this.ack.bind(this, msg)
                msg.nack = this.nack.bind(this, msg)
            }

            handler.call(this, msg)
        }, options)
    }

    ack () {
        this.currentChannel.ack.apply(this.currentChannel, arguments)
    }

    nack () {
        this.currentChannel.nack.apply(this.currentChannel, arguments)
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
