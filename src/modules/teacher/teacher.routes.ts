import { Router } from 'express';
import { checkStatusOfRegistration, editFinanceDetails, editPersonalDetails, editProfessionalDetails, fetchTeacher, getTeacherById, saveFinanceInfo, savePersonalInfo, saveProfessionalInfo } from './teacher.controller';

const teacherRouter = Router();

teacherRouter.post('/create-teacher/save-professional-info',saveProfessionalInfo);
teacherRouter.post('/create-teacher/save-personal-info',savePersonalInfo);
teacherRouter.post('/create-teacher/save-finance',saveFinanceInfo);

teacherRouter.post('/edit-teacher/edit-professional/:id',editProfessionalDetails);
teacherRouter.post('/edit-teacher/edit-personal/:id',editPersonalDetails);
teacherRouter.post('/edit-teacher/edit-finance/:id',editFinanceDetails);

teacherRouter.get('/fetch-teacher', fetchTeacher);
teacherRouter.post('/fetch-all-data-teacher/:id', getTeacherById);

teacherRouter.post('/status-of-registration', checkStatusOfRegistration);

export default teacherRouter;