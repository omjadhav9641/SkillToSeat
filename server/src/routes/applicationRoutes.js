import {Router} from 'express'; import {protect} from '../middleware/auth.js'; import {myApplications,createApplication,updateApplication,deleteApplication} from '../controllers/applicationController.js';
const r=Router(); r.use(protect);r.get('/',myApplications);r.post('/',createApplication);r.patch('/:id',updateApplication);r.delete('/:id',deleteApplication);export default r;
