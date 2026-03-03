import dotenv from 'dotenv'
dotenv.config()

import connectDB from './config/db'
connectDB()

import  express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import chalk from 'chalk'
import fileUpload from 'express-fileupload';
import corsConfig from './utils/cors'
import userRouter from './modules/user/user.routes'
import teacherRouter from './modules/teacher/teacher.routes'
import studentRouter from './modules/student/student.routes'



const app = express()

app.use(cors(corsConfig))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(
  fileUpload({
    useTempFiles: false,
  })
);


app.listen(
    process.env.PORT || 8080, 
    ()=>console.log(chalk.yellowBright((`Server is running on: http://localhost:${process.env.PORT}`)))
)



//EndPoints
app.use('/api/v1/user', userRouter);
app.use('/api/v1/teacher', teacherRouter);
app.use('/api/v1/student', studentRouter);