const replies = {
  noOrderFound: {
    fr: 'Quel est votre numéro de commande? (Exemple de numéro de commande: A234)',
    en: 'What\'s your order number? (order number example: A234)',
  },
  orderNotExist: {
    fr: 'Désolé, votre commande n\'existe pas. Etes-vous sûr du numéro? (Exemple de numéro de commande: A234)',
    en: 'Sorry, your order doest not exist. Are you sure about your order number? (order number example: A234)',
  },
  orderFound: {
    fr: 'Votre commande ORDER_ID est ORDER_STATUS.',
    en: 'Your order ORDER_ID is ORDER_STATUS',
  },
  greetings: {
    en: 'Hello, how can I help you?',
    fr: 'Bonjour, comment puis-je vous aider?',
  },
  goodbye: {
    en: 'Goodbye',
    fr: 'Au revoir',
  },
  thanks: {
    en: 'You are welcome',
    fr: 'Je vous en prie',
  }
}

module.exports = {
  handledIntent: 'order-number',
  handledEntity: 'id',
  handledLanguages: ['en', 'fr'],
  floatingIntents: [
    'greetings',
    'goodbye',
    'thanks',
  ],
  getReply: (db, entities, language) => new Promise(resolve => {
    const id = (entities.id || [])[0] || null
    if (id) {
      const order = db.find(entry => entry.orderId === id.value.toUpperCase())
      if (order) {
        resolve({ type: 'text', content: replies.orderFound[language].replace('ORDER_ID', id.value.toUpperCase()).replace('ORDER_STATUS', order.state[language]) })
      }
      resolve({ type: 'text', content: replies.orderNotExist[language] })
    }
    resolve({ type: 'text', content: replies.noOrderFound[language] })
  }),
  getFloatingReply: (intent, language) => new Promise(resolve => {
    resolve({ type: 'text', content: replies[intent][language] })
  })
}
