import { AppError } from '../utils/errors.js';
export const validate = schema => (req,_res,next)=>{const result=schema.safeParse({body:req.body,params:req.params,query:req.query});if(!result.success)return next(new AppError(result.error.issues[0]?.message||'Invalid request.',400));req.validated=result.data;next();};
