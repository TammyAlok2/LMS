import {mongoose,Schema,model } from 'mongoose'

const courseSchema = new Schema({

    title:{
        type:String,
        required:[true,'Title is required'],
        minLength:[5,'Minimum length of title is 5'],
        maxLength:[50,'Max length of length  is 50'],
        trim:true,
    },
    description:{
        type:String,
        required:[true,'Description is required'],
        minLength:[5,'Minmum length of description  is 5'],
        maxLength:[200,'Max length of length  is 25'],
        trim:true,
    },
    category:{
        type:String,
        required:[true,'Category is required'],
        trim:true,
    },
    lectures:[
        {
            title:String,
            description :String,
            lecture:{
                public_id:{
                    type:String,
                    required:true,
                },
                secure_url:{
                    type:String,
                    required:true,
                }
            }
        }
    ],
    numberOfLectures: {
        type: Number,
        default: 0,
      },
    createdBy:{
        type:String,
        required:[true,'Educator name is required']
    },
    thumbnail:{
        public_id:{
            type:String,
            required:true,
        },
        secure_url:{
            type:String,
            required:true,
        }
    }
},
{
    timestamps:true
}


)

export const Course =  mongoose.model('Course',courseSchema)