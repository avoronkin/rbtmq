const amqp = require('amqplib')
const bootstrap = require('./bootstrap')
let connection

module.exports = async function ({url = 'amqp://localhost', exchanges}) {
    if (!connection) {
        connection = await amqp.connect(url)
    }

    const channels = await bootstrap({exchanges, connection})

    return {
        connection,
        channels,

        async publish (exchange, routingKey, content, options) {
            const ch = channels.exchanges[exchange].ch

            return ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(content)), options)
        },

        async consume (queue, handler, options) {
            const ch = channels.queues[queue].ch

            return ch.consume(queue, function (msg) {
                msg.data = JSON.parse(msg.content.toString())
                handler.call({ch}, msg)
            }, options)
        }
    }
}
