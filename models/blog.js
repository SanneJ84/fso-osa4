// Täällä määritellään blogimallin skeema Mongoose-kirjaston avulla

const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({                              // Määrittelee blogin skeeman joka sisältää seuraavat kentät:
  title: String,
  author: String,
  url: String,
  likes: { type: Number, default: 0 }
})

blogSchema.set('toJSON', {                                        // Määrittelee, miten blogi-objekti muunnetaan JSON-muotoon
  transform: (document, returnedObject) => {                      // Muuntaa dokumentin JSON-muotoon
    returnedObject.id = returnedObject._id.toString()             // Muuttaa _id kentän id kentäksi
    delete returnedObject._id                                     // Poistaa _id kentän
    delete returnedObject.__v                                     // Poistaa __v kentän, joka on Mongoose:n versiotunniste
  }
})

module.exports = mongoose.model('Blog', blogSchema)               // Vienti blogimallista, jotta voidaan käyttää sovelluksessa