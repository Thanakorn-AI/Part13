// Part13/cli.js
require('dotenv').config()
const { Sequelize, QueryTypes } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

const main = async () => {
  try {
    console.log('Trying to connect to database...')
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
    
    const blogs = await sequelize.query("SELECT * FROM blogs", { type: QueryTypes.SELECT })
    
    console.log('Executing (default): SELECT * FROM blogs')
    blogs.forEach(blog => {
      console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`)
    })
    
    sequelize.close()
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

main()