// Middleware pyyntojen kirjaamiseen, tuntemattomien päätepisteiden käsittelyyn ja virheiden hallintaan


// Kirjaa saapuvat HTTP-pyynnöt (metodi, polku, ja body)
const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)              // Kirjaa HTTP-metodin (esim. GET, POST)
  logger.info('Path:  ', request.path)                // Kirjaa pyynnön polun (esim. /api/blogs)
  logger.info('Body:  ', request.body)                // Kirjaa pyynnön sisällön (body)
  logger.info('---')                                  // Erotin kirjausten välillä
  next()                                              // Siirtyy seuraavaan middlewareen tai reittikäsittelijään
}


// Käsittelee tuntemattomat päätepisteet (404-virhe)
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// Käsittelee virheet, kuten malformatted (väärin muotoiltu) ID:t tai validointivirheet
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