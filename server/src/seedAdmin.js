import 'dotenv/config';
import mongoose from 'mongoose';
import {connectDB} from './config/db.js';
import User from './models/User.js';
if(!process.env.ADMIN_EMAIL){console.error('Set ADMIN_EMAIL in server/.env first.');process.exit(1);}
await connectDB();
const user=await User.findOneAndUpdate({email:process.env.ADMIN_EMAIL.toLowerCase()},{role:'ADMIN'},{new:true});
if(!user){console.error('No account found. Register that email first, then rerun this command.');process.exitCode=1;}else console.log(`Administrator enabled for ${user.email}`);
await mongoose.disconnect();
