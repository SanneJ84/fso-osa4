// blogeihin liittyvien reittien määrittely tässä moduulissa

const blogsRouter = require('express').Router()             // Luodaan uusi olio expressin Router-luokasta, joka mahdollistaa reittien määrittelyn
const Blog = require('../models/blog')
const User = require('../models/user')                     // Tuodaan Blog-malli, joka on määritelty erikseen models-kansiossa
const jwt = require('jsonwebtoken')                     // Tuodaan jsonwebtoken-kirjasto, jota käytetään käyttäjän todennukseen

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/', async (request, response, next) => {   // Tämä reitti palauttaa kaikki blogit
  try {
    const blogs = await Blog.find({}).populate('user', {username: 1, name: 1})    // Etsii kaikki blogit tietokannasta ja täyttää käyttäjän tiedot
    response.json(blogs)                                                          // Palauttaa blogit JSON-muodossa
  } catch (error) {                                                               // Käsittelee mahdolliset virheet
    next(error)                                                                   // Siirtää virheen seuraavalle middlewarelle
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


blogsRouter.post('/', async (request, response) => {
  const body = request.body                                       // Tarkistaa, että pyyntö sisältää tarvittavat tiedot

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)    //Apufunkitio getTokenFrom(request) hakee tokenin pyyntöön liitetystä Authorization-headerista.
                                                                                // Tokenin oikeellisuus tarkistetaan jwt.verify-funktiolla, joka ottaa tokenin ja salaisuuden (SECRET) argumentteina.
                                                                                // Jos token on voimassa, se palauttaa dekoodatun tokenin, joka sisältää käyttäjän ID:n.
  if (!decodedToken.id) {                                                       // Jos token on puutteellinen tai virheellinen
    return response.status(401).json({ error: 'token invalid' })                // Palauttaa 401-virheen, joka tarkoittaa, että käyttäjä ei ole todennettu
  }
  const user = await User.findById(decodedToken.id)
  if (!user) {                                                                  // Jos käyttäjää ei löydy
    return response.status(400).json({ error: 'User not found' })               // Palauttaa 400-virheen, jos käyttäjää ei löydy
  }

  const blog = new Blog({                                         // Luo uusi blogi-olio joka sisältää seuraavat kentät:
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    content: body.content,
    important: body.important || false,
    user: user._id                                                // Asettaa käyttäjän ID:n blogiin
  })

    const savedBlog = await blog.save()                           // Tallentaa uuden blogin tietokantaan
    user.blogs = user.blogs.concat(savedBlog._id)                 // Lisää blogin ID:n käyttäjän blogien listaan
    await user.save()                                             // Tallentaa päivitetyn käyttäjän tietokantaan

    response.status(201).json(savedBlog)                          // Palauttaa tallennetun blogin JSON-muodossa
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