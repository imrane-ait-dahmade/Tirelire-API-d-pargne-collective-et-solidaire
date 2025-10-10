import UserModel from "../Models/User.js";
import bcrypt from "bcryptjs";
import { JsonWebTokenError } from "jsonwebtoken";
import jwt from "jsonwebtoken";
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
        const user = await UserModel.findOne({ email: email});
        console.log(user);
        if (user) {
             const passwordTrue = bcrypt.compare(password ,user.password);
        if (!passwordTrue) {
            return console.log('password is not correct ');
        }

        return user;
        }

        return 0 ;
       
    }

}