const amqp = require('amqplib')
const bootstrap = require('./bootstrap')
let connection

module.exports = async function (config = {}) {
    if (!connection) {
        connection = await amqp.connect(config.url || 'amqp://localhost')
    }

    const { exchanges, queues } = await bootstrap({exchanges: config.exchanges, connection})

    return {
        connection,
        exchanges,
        queues,

        async exchange () {

        },

        async publish (exchange, routingKey, content, options) {
            const ch = exchanges[exchange].ch

            return ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(content)), options)
        },

        async consume (queue, handler, options) {
            const ch = queues[queue].ch

            return ch.consume(queue, function (msg) {
                msg.data = JSON.parse(msg.content.toString())
                handler.call({ch}, msg)
            }, options)
        }
    }
}
