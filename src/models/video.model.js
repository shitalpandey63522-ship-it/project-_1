import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; 


const videoSchema =new Schema({

    videofile:{
        type:String, //cloudinary link
        required:true,
    },
    thumbnail:{
        type:String, //cloudinary link
        required:true,
    },
    title:{
        type:String, 
        required:true,
    },
    description:{
        type:String, 
        required:true,
    },
    duration:{
        type:String, //cloudinary link
        required:true,
    },

    views:{
        type:Number,
        default:0

    },
     isPublished:{
  type :Boolean,
  default:true

    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    }






},{timestamps

})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video =mongoose.model("video"  ,videoSchema);
