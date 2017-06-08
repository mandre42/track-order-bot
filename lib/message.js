const recastai = require('recastai')
const fs = require('fs')
const usecase = require('./usecase')

const conversations = []

const consumeDb = () => new Promise((success, failure) => {
  const dbPath = process.cwd() === '/var/task' ? 'db.json' : 'lib/db.json'
  fs.readFile(dbPath, (err, data) => {
    if (err) { return failure(err) }
    return success(JSON.parse(data))
  })
})

const replyMessage = (message) => {
  // Get text from message received
  const text = message.content

  replyText(text, message.senderId).then(reply => {
    message.addReply(reply)
    return message.reply()
  }).then(() => {
    console.log('Message sent')
  }).catch(err => {
    console.error('Error while sending message to Recast.AI', err)
  })
}

const notHandled = { fr: 'Désolé, je n\'ai pas compris. Un agent va reprendre la main afin de mieux vous aider.', en: 'Sorry I did not understand, an agent will take over to assist you.' }

const callSF = (res) => Promise.resolve(res)

const handleUsecase = (db, result, userId) => {
  return usecase.getReply(db, result.entities, conversations, userId)
}

const handleFloating = (intent, userId) => {
  return usecase.getFloatingReply(intent, conversations, userId)
}

const replyText = (text, userId) => {
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE || conversations[userId])
  return new Promise((success, failure) => {
    Promise.all([consumeDb(), request.analyseText(text)])
      .then(([db, result]) => {
        console.log(result.intents)
        console.log(result.entities)
        const intent = result.intent()

        console.log('userId: ' + userId + ' | language: ' + conversations[userId])
        if (!conversations[userId] && usecase.handledLanguages.indexOf(result.processing_language) !== -1) {
          conversations[userId] = result.processing_language
          console.log('new language of id ' + userId + ': ' + conversations[userId])
        }

        if (intent && conversations[userId]) {
          console.log('Language for id ' + userId + ': ' + conversations[userId])
          if (intent.slug === usecase.handledIntent) {
            return success(handleUsecase(db, result, userId))
          } else if (usecase.floatingIntents.indexOf(intent.slug) !== -1) {
            return success(handleFloating(intent.slug, userId))
          }
        }

        callSF(notHandled[conversations[userId]]).then(res => success({ type: 'text', content: res }))
      })
      .catch(failure)
  })
}

module.exports = { replyText, replyMessage }
