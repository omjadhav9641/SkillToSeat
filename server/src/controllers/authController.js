import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, cookieOptions } from '../utils/auth.js';
import { AppError, asyncHandler } from '../utils/errors.js';
export const register = asyncHandler(async (req,res) => { const {name,email,password}=req.body; if(!name || !email || !password || password.length<8) throw new AppError('Name, email and a password of at least 8 characters are required.'); const user=await User.create({name,email,password:await bcrypt.hash(password,12),role:'STUDENT'}); res.cookie('token',signToken(user.id),cookieOptions()).status(201).json({user:{id:user.id,name:user.name,email:user.email,role:user.role}}); });
export const login = asyncHandler(async(req,res)=>{ const user=await User.findOne({email:req.body.email?.toLowerCase()}).select('+password'); if(!user || !(await bcrypt.compare(req.body.password||'',user.password))) throw new AppError('Email or password is incorrect.',401); res.cookie('token',signToken(user.id),cookieOptions()).json({user:{id:user.id,name:user.name,email:user.email,role:user.role}}); });
export const logout=(_req,res)=>res.clearCookie('token',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:process.env.NODE_ENV==='production'?'none':'lax',path:'/'}).json({message:'Signed out.'});
export const me=asyncHandler(async(req,res)=>res.json({user:{id:req.user.id,name:req.user.name,email:req.user.email,role:req.user.role}}));


