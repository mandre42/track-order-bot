const recastai = require('recastai')
const fs = require('fs')
const usecase = require('./usecase')

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

const callSF = () => Promise.resolve('TODO')

const handleUsecase = (db, result, userId, language) => {
  return usecase.getReply(db, result.entities, language)
}

const handleFloating = (intent, language) => {
  return usecase.getFloatingReply(intent, language)
}

const replyText = (text, userId) => {
  const request = new recastai.request(process.env.REQUEST_TOKEN, process.env.LANGUAGE)
  return new Promise((success, failure) => {
    Promise.all([consumeDb(), request.analyseText(text)])
      .then(([db, result]) => {
        console.log(result.intents)
        console.log(result.entities)
        const intent = result.intent()

        if (intent && usecase.handledLanguages.indexOf(result.language) !== -1) {
          if (intent.slug === usecase.handledIntent) {
            return success(handleUsecase(db, result, userId, result.language))
          } else if (usecase.floatingIntents.indexOf(intent.slug) !== -1) {
            return success(handleFloating(intent.slug, result.language))
          }
        }

        callSF().then(res => success({ type: 'text', content: res }))
      })
      .catch(failure)
  })
}

module.exports = { replyText, replyMessage }
