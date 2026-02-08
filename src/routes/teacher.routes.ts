import { Router } from 'express';
import { createTeacher } from '../controllers/teacher.controller';

const teacherRouter = Router();

teacherRouter.post('/create-teacher', createTeacher);

export default teacherRouter;