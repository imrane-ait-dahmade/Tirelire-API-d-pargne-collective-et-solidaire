import GroupModel from "../Models/Group";
import UserModel from "../Models/User";
export default class GroupService{

    static async CreateGroup(group){
        try{
            
                const group = GroupModel.create(group);
                return await group
        }catch(e){
                console.log('error');
        }
    }

    static async AddMember(Member,groupId){
        try{
           return  await  GroupModel.findByIdAndUpdate(
                groupId,
                { $push: { members: userId } },  
                { new: true }                     
    )
        }catch(e){
              console.log('error');
        }
    }


}