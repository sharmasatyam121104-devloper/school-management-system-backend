import dotenv from 'dotenv'
dotenv.config()

import connectDB from './config/db'
connectDB()

import  express, { Response }  from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import chalk from 'chalk'
import corsConfig from './utils/cors'

const app = express()
app.listen(
    process.env.PORT || 8080, 
    ()=>console.log(chalk.yellowBright((`Server is running on: http://localhost:${process.env.PORT}`)))
)

app.use(cors(corsConfig))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/',(_,res:Response) => {
    res.send("Hello from backend!")
})