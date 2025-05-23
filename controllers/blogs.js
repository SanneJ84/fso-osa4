// blogeihin liittyvien reittien määrittely tässä tiedostossa

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogsRouter.post('/', (request, response, next) => {
  const body = request.body                                 // Tarkistaa, että pyyntö sisältää tarvittavat tiedot

  const blog = new Blog({                                   // Luo uusi blogi-olio joka sisältää seuraavat kentät:
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    content: body.content,
    important: body.important || false,
  })

  blog.save()
    .then(savedBlog => {
      response.json(savedBlog)
    })
    .catch(error => next(error))
})

blogsRouter.delete('/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

blogsRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body

  Blog.findById(request.params.id)
    .then(blog => {
      if (!blog) {
        return response.status(404).end()
      }

      blog.content = content
      blog.important = important

      return blog.save().then((updateBlog) => {
        response.json(updateBlog)
      })
    })
    .catch(error => next(error))
})

module.exports = blogsRouter