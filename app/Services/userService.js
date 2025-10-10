import UserModel from "../Models/User.js";

export default class userService{

 static async create(data){
    const user = new UserModel(data);
    return await user.save();
    }
    static async all(){
        const users = await UserModel.find();
        console.log(users);
        return users;
    }

    static async find(id){
            const user = await UserModel.findOne(id);
            return user ;
    }

    static async login(email,password){
        const user = await UserModel.findOne({
            $and:[
                {email:email},
                {password:password}
            ]
            });
            if(!user){
                return console.log('l email or password is not correct')
            }
        return user;
    }

}