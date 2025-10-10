const { default: mongoose } = require("mongoose");

class User {
    constructor(){
       const UserSchema = new mongoose.Schema(
            {
                id: Number,
                name: String,
                email: String,
                password: String,
            }
        )
        const User = mongoose.model('User', UserSchema);
    }
 

}