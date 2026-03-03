import { Router } from 'express';
import { checkStatusOfRegistration, fetchTeacher, getTeacherById, saveFinanceInfo, savePersonalInfo, saveProfessionalInfo } from '../controllers/teacher.controller';

const teacherRouter = Router();

teacherRouter.post('/create-teacher/save-professional-info',saveProfessionalInfo);
teacherRouter.post('/create-teacher/save-personal-info',savePersonalInfo);
teacherRouter.post('/create-teacher/save-finance',saveFinanceInfo);
teacherRouter.get('/fetch-teacher', fetchTeacher);
teacherRouter.post('/fetch-all-data-teacher/:id', getTeacherById);
teacherRouter.post('/status-of-registration', checkStatusOfRegistration);

export default teacherRouter;