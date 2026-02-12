import { Router } from "express";
import { createStudent, fetchAllDataOfStudent, fetchAllStudent, uploadStudentDocumnets } from "../controllers/student.controller";

const studentRouter = Router()

studentRouter.post('/create-student', createStudent)
studentRouter.post('/upload-student-documnet/:id', uploadStudentDocumnets)
studentRouter.post('/fetch-all-data-student/:id', fetchAllDataOfStudent)
studentRouter.get("/fetch-student", fetchAllStudent)

export default studentRouter