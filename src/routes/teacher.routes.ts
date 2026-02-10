import { Router } from 'express';
import { createTeacher, fetchTeacher, getTeacherById } from '../controllers/teacher.controller';

const teacherRouter = Router();

teacherRouter.post('/create-teacher', createTeacher);
teacherRouter.get('/fetch-teacher', fetchTeacher);
teacherRouter.post('/fetch-all-data-teacher/:id', getTeacherById);

export default teacherRouter;