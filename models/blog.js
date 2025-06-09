// Täällä määritellään blogimallin skeema Mongoose-kirjaston avulla

const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({                              // Määrittelee blogin skeeman joka sisältää seuraavat kentät:
  title: String,                                                  // Blogiotsikko, joka on merkkijono
  author: String,                                                 // Blogin kirjoittaja, joka on merkkijono
  url: String,                                                    // Blogin URL, joka on merkkijono
  likes: { type: Number, default: 0 } ,                           // Blogin tykkäykset, joka on numero ja oletusarvo 0
})

blogSchema.set('toJSON', {                                        // Määrittelee, miten blogi-objekti muunnetaan JSON-muotoon
  transform: (document, returnedObject) => {                      // Muuntaa dokumentin JSON-muotoon
    returnedObject.id = returnedObject._id.toString()             // Muuttaa _id kentän id kentäksi
    delete returnedObject._id                                     // Poistaa _id kentän, joka on Mongoose:n luoma uniikki tunniste eikä sitä tarvita JSON-muodossa
    delete returnedObject.__v                                     // Poistaa __v kentän, joka on Mongoose:n automaattinen versiotunniste
  }
})

module.exports = mongoose.model('Blog', blogSchema)               // Vienti blogimallista, jotta voidaan käyttää sovelluksessa