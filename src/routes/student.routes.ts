import { Router } from "express";
import { createStudent } from "../controllers/student.controller";

const studentRouter = Router()

studentRouter.post('/create-student', createStudent)

export default studentRouter