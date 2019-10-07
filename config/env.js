const config = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  zarApi: process.env.ZAR_API,
}

module.exports = config
