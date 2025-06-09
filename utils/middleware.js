// Middleware pyyntojen kirjaamiseen, tuntemattomien päätepisteiden käsittelyyn ja virheiden hallintaan


// Tuodaan logger joka on erillinen moduuli, jossa on määritelty lokituslogiikka
const logger = require('./logger')


// requestLogger middleware, joka tallentaa saapuvat HTTP-pyynnöt lokiin
const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)              // Kirjaa HTTP-metodin (esim. GET, POST jne.)
  logger.info('Path:  ', request.path)                // Kirjaa pyynnön siihen polkuun johon pyyntö kohdistuu (esim. /api/blogs)
  logger.info('Body:  ', request.body)                // Kirjaa pyynnön sisällön (body)
  logger.info('---')                                  // Erotin kirjausten välillä
  next()                                              // Siirtyy seuraavaan middlewareen tai reittikäsittelijään
}


// unknownEndpoint middleware, joka käsittelee tuntemattomat päätepisteet 
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// errorHandler middleware, joka käsittelee mahdolliset virheet, kuten väärin muotoillut ID:t tai validointivirheet
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)                                        // Siirtää virheen seuraavalle virheenkäsittelijälle, jos ei kuulu käsiteltäviin virheisiin
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}