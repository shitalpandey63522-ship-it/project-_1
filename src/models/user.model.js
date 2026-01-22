import momgoose ,{Schema} from 'mongoose';

const  userSchema=new Schema({timestamps:true},

    {
        username:{
                type:String,
                required:true,
                unique:true,
                trim:true,
                index:true,
                lowercase:true

        },
         email:{
                type:String,
                required:true,
                unique:true,
                trim:true,
                lowercase:true
                

        },
         fullname:{
                type:String,
                required:true,
               index:true,
                trim:true,              

        },
        avatar:{
                type:String,//clouidinary link
                required:true,
                            

        },
        coverimage:{
                type:String,//clouidinary link
                required:true,
                            

        },
        watchHistory:{
            type:Schema.Types.ObjectId,
            ref:"video"

    },
     password:{
            type:String,
            required:[true,"password is requried"],


    },
    refreshToken:{
            type:String
            


    }
   
}
 

)

export const User=mongoose.model("User",userSchema);


