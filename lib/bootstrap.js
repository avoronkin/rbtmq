const Promise = require('bluebird')

module.exports = async function ({
    exchanges = [],
    connection
}) {

    const cache = {
        exchanges: {},
        queues: {}
    }

    await Promise.map(exchanges || [], async exchange => {
        const ch = await connection.createChannel()
        cache.exchanges[exchange.name] = { ch }

        await ch.assertExchange(exchange.name, exchange.type, exchange.options)

        await Promise.map(exchange.queues || [], async queue => {
            const ch = await connection.createChannel()
            cache.queues[queue.name] = { ch }

            if (queue.prefetch) {
                await ch.prefetch(queue.prefetch)
            }

            const {queue: queueName} = await ch.assertQueue(queue.name, queue.options)
            await ch.bindQueue(queueName, exchange.name, queue.pattern || '')
        })
    })

    return cache
}
