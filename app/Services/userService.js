import UserModel from "../Models/User.js";
import bcrypt from "bcryptjs";
import { json } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export default class userService {

    static async create(data) {

        const user = new UserModel(data);
        return await user.save();
    }
    static async all() {
        const users = await UserModel.find();
        console.log(users);
        return users;
    }

    static async find(id) {
        const user = await UserModel.findOne(id);
        return user;
    }

    static async login(email,password) {
         const SECRET_KEY = process.env.JWT_SECRET;
        const user = await UserModel.findOne({ email: email});
        console.log(user);
        if (user) {
             const passwordTrue = bcrypt.compare(password ,user.password);
        if (!passwordTrue) {
            return console.log('password is not correct ');
        }
        const jwtTocken = jwt.sign(
            {email:email , id:user.id },
            SECRET_KEY ,
    { expiresIn: "2h" } 
        )
        return {user,jwtTocken};
        }

        return 0 ;
       
    }

}