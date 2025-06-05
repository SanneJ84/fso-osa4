// blogeihin liittyvien reittien määrittely tässä tiedostossa

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {   // Tämä reitti palauttaa kaikki blogit
  try {
    const blogs = await Blog.find({})                       // Etsii kaikki blogit tietokannasta
    response.json(blogs)                                    // Palauttaa blogit JSON-muodossa
  } catch (error) {                                         // Käsittelee mahdolliset virheet
    next(error)                                             // Siirtää virheen seuraavalle middlewarelle
  }
  })

blogsRouter.get('/:id', async (request, response, next) => {    // Tämä reitti palauttaa yksittäisen blogin ID:n perusteella
  try {
    const blog = await Blog.findById(request.params.id)         // Etsii blogin ID:n perusteella
      if (blog) {                                               // Jos blogi löytyy
        response.json(blog)                                     // Palauttaa blogin JSON-muodossa
      } else {                                                  // Jos blogia ei löydy
        response.status(404).end()                              // Palauttaa 404-virheen
      }
  } catch (error) {                                             // Käsittelee mahdolliset virheet, kuten väärin muotoillut ID:t
    next(error)                                                 // Siirtää virheen seuraavalle middlewarelle
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body                                 // Tarkistaa, että pyyntö sisältää tarvittavat tiedot

  const blog = new Blog({                                   // Luo uusi blogi-olio joka sisältää seuraavat kentät:
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    content: body.content,
    important: body.important || false,
  })

  try {
    const savedBlog = await blog.save()                           // Tallentaa uuden blogin tietokantaan
    response.status(201).json(savedBlog)                          // Palauttaa tallennetun blogin JSON-muodossa
  } catch (error) {                                               // Käsittelee mahdolliset virheet, kuten validointivirheet
    next(error)                                                   // Siirtää virheen seuraavalle middlewarelle
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {   // Tämä reitti poistaa blogin ID:n perusteella
  try {
    await Blog.findByIdAndDelete(request.params.id)               // Etsii ja poistaa blogin ID:n perusteella
      response.status(204).end()                                  // Palauttaa 204-tilakoodin, joka tarkoittaa, että pyyntö onnistui mutta ei palauteta sisältöä
  } catch (error) {                                               // Käsittelee mahdolliset virheet, kuten väärin muotoillut ID:t
    next(error)                                                   // Siirtää virheen seuraavalle middlewarelle
  }
})

blogsRouter.put('/:id', async (request, response, next) => {     // Tämä reitti päivittää blogin ID:n perusteella
  const { content, important } = request.body                     

  try {
    const blog = await Blog.findById(request.params.id)         // Etsii blogin ID:n perusteella
      if (!blog) {                                              // Jos blogia ei löydy
        return response.status(404).end()                       // Palauttaa 404-virheen
      }

      blog.content = content                                    // Päivittää blogin sisällön
      blog.important = important                                // Päivittää blogin tärkeyden

      const updateBlog = await blog.save()                      // Tallentaa päivitetyn blogin tietokantaan
      response.json(updateBlog)                                 // Palauttaa päivitetyn blogin JSON-muodossa
  } catch (error) {                                             // Käsittelee mahdolliset virheet, kuten väärin muotoillut ID:t
    next(error)                                                 // Siirtää virheen seuraavalle middlewarelle
  }
})

module.exports = blogsRouter                                    // Vienti reititiedostosta, jotta voidaan käyttää sovelluksessa