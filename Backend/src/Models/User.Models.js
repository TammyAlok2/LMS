import { Schema ,mongoose}  from "mongoose";
import JWT from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'


const userSchema = new Schema({
    username : {
        type:String,
        requried:[true,'Username is required '],
       // maxLength:[20,'Passward does not have more than 20 charcter '],
        minLength:[5,'Passward should have minimum 5 charcter '],
        trim:true,
        
    },
    email:{
        type:String,
        required:[true,"Email is requried "],
        unique:[true,'already registered'],
        lowercase:true,
    },
    passward:{
        type:String,
        required:[true,"Passward is required "],

        minLength:[5,'Passward should have minimum 5 charcter '],
        select:false,

    },
    forgotPasswardToken:{
        type:String,
    },
    forgotPasswardExpiryDate:{
        type:Date
    },
    avatar:{
       public_id:{
        type:String,
       },
       secure_url:{
        type:String,
       }

    },
    role:{
type:String,
enum:["USER","ADMIN"],
default:'USER'
    }

    , 
    subscription:{
        id:String,
        status:String,
    }
},{
    timestamps:true,
})

userSchema.pre('save',async function (next){

if(!this.isModified('passward')){
    return next()

}

this.passward = await bcrypt.hash(this.passward ,10);
return next()

})

userSchema.methods =  {
     jwtToken () {
       return JWT.sign(
        {
            id:this._id,
            email:this.email,
            subscription :this.subscription,
            role:this.role,
        },
    process.env.SECRET,
        {
            expiresIn:'24h'
        }
       )
    },



    comparePassward :  async function (plainTextPassward){
        return await bcrypt.compareSync(plainTextPassward,this.passward)
        
    },
    

generatePasswardResetToken : async function (){
    const  resetToken = crypto.randomBytes(20).toString('hex');

    this.forgotPasswardToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
    ;

    this.forgotPasswardExpiryDate = Date.now() + 15*60*1000; // 15 min given for reset passward link

    return resetToken;
}

}

export const User = mongoose.model('User',userSchema)