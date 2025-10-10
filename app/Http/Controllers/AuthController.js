import userService from "../../Services/userService.js";
import UserService from "../../Services/userService.js";
// const userService = new UserService();

export default class AuthController {

  static async Register(req, res) {
    try {
      const {email,name,password } = req.body;
     
      
      // Simple validation
      if (!email || !name || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = { email, name, password };
      const newUser = await UserService.create(user);

      return res.status(201).json(newUser);

    } catch (e) {
      console.error("Error:", e);
      res.status(500).json({ error: e.message });
    }
  }

  static async GetAll(req,res){
      try{
            console.log('entrer');
                        const users = await UserService.all();
                        console.log(users);
                        return res.json(users);
      }
catch(e){
      console.log('error ' , e);
}
  }

  static async find(req,res){
      try{       
            const user = await userService.find(req.id);
            return res.json(user);
      }catch(e){
            console.log('error',e);
      }
  }
  static async login(req,res){
      try{
            const user = await userService.login(req.body.email,req.body.password);
                  return res.json(user);       
      }
      catch(e){
            console.log('error',e);
      }
  }


}
