import Activity from '../models/Activity.js';
export async function recordActivity(userId){const dateKey=new Date().toISOString().slice(0,10);await Activity.findOneAndUpdate({user:userId,dateKey},{$inc:{actions:1}},{upsert:true,new:true});}
