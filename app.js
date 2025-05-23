const logger = require('./utils/logger')                      // Lataa logger-moduuli, joka on määritelty utils-kansiossa
const config = require('./utils/config')                      // Lataa konfiguraatiomoduuli, joka on määritelty utils-kansiossa
const express = require('express')                            // Lataa Express-kirjaston
const mongoose = require('mongoose')                          // Lataa mongoose-kirjaston
const middleware = require('./utils/middleware')              // Lataa middleware-moduuli, joka on määritelty utils-kansiossa
const blogsRouter = require('./controllers/blogs')            // Lataa blogsRouter-moduuli, joka on määritelty controllers-kansiossa
const app = express()                                         // Luo uuden Express-sovelluksen     

logger.info('connecting to', config.MONGODB_URI) 

mongoose
.connect(config.MONGODB_URI)                                  // Yhdistää MongoDB-tietokantaan käyttäen MONGODB_URI-ympäristömuuttujaa 
.then(() => {
    logger.info('connected to MongoDB')    
    }
    )
.catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
    }
)

app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/blogs', blogsRouter)                            // Määrittelee reitin /api/blogs, joka käyttää blogRouteria

app.get('/', (request, response) => {                         // Määrittelee reitin pääsivulle (/), joka palauttaa HTML-sisältöä (tässä "Hello World") eikä "Cannot GET /" -virhettä
    response.send('<h1>Hello World!</h1>')                    // Lähettää asiakkaalle HTML-vastauksen, joka sisältää pään otsikon "Hello World!"
    }
)

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})