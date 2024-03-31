import { User } from "../Models/User.Models.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js"
import { asyncHandler } from "../Utils/AsyncHandler.js"
import emailValidator from 'email-validator'
import bcrypt from 'bcrypt'
import { updateOnCloudinary, uploadOnCloudaniry } from "../Utils/Cloudinary.js";
import sendEmail from "../Utils/sendMail.js";
import crypto from 'crypto'

const signUp = asyncHandler(async(req,res,next)=>{

    // steps for signUP
    //1) Taking the user data from fronted 
    // 2) Checking the data according to our requrirement , not blank , not too short or many more check 
    // 3) checking for the existing user 
    // 4) now hash the passward or bcrypt it 
    // 5) Create the user 
    // 6) Send the response 
    const {username,email,passward,confirmPassward}= req.body;
    console.log(username,email,passward,confirmPassward)

    // checking the blank response 
    if([username,email,passward,confirmPassward].some((value)=>value.trim() ==='')){
        throw new ApiError(400,'All fields are required')
    }

    // checking the email is valid or not 
    const validEmail = emailValidator.validate(email);
    if(!validEmail){
        throw new ApiError(402,"Enter valid email")
    }
    // checking passward match with confirm passward 
    if(passward !== confirmPassward){
        throw new ApiError(402,"Passward and confirm passward does not match")
    }

// checking email or username already regsiter or not 
const existedUser = await User.findOne({
    $or:[{username},{email}]
})
if (existedUser) {
    throw new ApiError(409, "User already exists")
}

const avatarLocalPath = req.files?.avatar[0].path;
console.log(avatarLocalPath)

if(!avatarLocalPath){
    throw new ApiError(400,"Please upload avatar")
}

const Avatar = await uploadOnCloudaniry(avatarLocalPath)


if(!Avatar){
    throw new ApiError(400,"Avatar file is required ")
}
//console.log(Avatar)

// making new user in the database 
    const user =  await User.create({
        username,
        email,
        passward,
        avatar:{
            public_id:Avatar?.public_id,
            secure_url:Avatar?.secure_url,
        }
    })
    if(!user){
        throw new ApiError(400,'user Registration failed')
    }

    // TODO :file upload
    await user.save();

    
const token = user.jwtToken();
user.passward = undefined

const cookieOption = {
    maxAge :7* 24*60*60*1000,
    httpOnly:true,

};

res.cookie("token",token,cookieOption)
    
    return res.status(200).json(
        new ApiResponse(201,user,"User created successfully ")
    )
 
   
})

const signIn = asyncHandler(async (req,res,next)=>{
    // steps for the sign in 
    //1 ) taking the user data from fronted 
    // 2) validating the data 
    //3 ) Checking in the database 
    // 4) matching the passward 
    // 5) sending the response of success 

    const {email,passward} = req.body;
   

    if( !email || !passward){
        throw new ApiError(400,"Every field required ")
    }
const validEmail = emailValidator.validate(email);
if(!validEmail){
    throw new ApiError(402,"Enter correct email ")
}

const user = await User.findOne({
    email
}).select('+passward')

if (!user) {
    throw new ApiError(409, "User does not found ")
}
if( ! await (bcrypt.compare(passward,user.passward))){
    throw new ApiError(400, 'Wrong passward')
}
if(user.email !== email){
    throw new ApiError(402,"User does not found ")
}



const token = user.jwtToken();
user.passward = undefined

const cookieOption = {
    maxAge : 24*60*60*1000,
    httpOnly:true,

};

res.cookie("token",token,cookieOption)
return res.status(200).json(
    new ApiResponse(200,user,"sign in successfully ")
)

})



const userInfo = asyncHandler(async(req,res,next)=>{
const userId = req.user.id;
    const userData =  await User.findById(userId);
    
    if(!userData){
        throw new ApiError(400,"user not found ")
    }

    return res.status(200).json(
        new ApiResponse(200,userData,'User fetched successfully ')
    )

})


const logout = asyncHandler(async (req,res,next)=>{

    try {
        const cookieOption = {
            expires : new Date(),
            httpOnly:true,
            maxAge: 0,
        }

        res.cookie("token",null,cookieOption)

        res.status(200).json(
            new ApiResponse(200 ,"logout successfully"),
           
        )

    } catch (error) {
        throw new ApiError(400,'failed to logout')
    }

})



const forgotPassward = asyncHandler( async(req,res, next)=>{
    // take the email from fronted and validaion 
    // find the email from the database that it is exist or not 
    // making a reset token using crypto hash 
    // saving that token in the databse 
    // creating the url in which the user can set his paswrd 
    // sending the mail using node mailer 
const {email}  = req.body;
console.log(email)

if(!email){
    throw new ApiError(400,"Email is requireed")
}

// finding email in the database 
const user = await User.findOne({email})

if(!user){
    throw new ApiError(400,"Email not found ")
}

// making reset token 
const resetToken = await user.generatePasswardResetToken();

await user.save()

const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
console.log(resetPasswordUrl)

  // We here need to send an email to the user with the token
  const subject = 'Reset Password';
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank" color="blue">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

try {
    await sendEmail(email, subject,message)

    return res.status(201).json(
        new ApiResponse(200,true,`reset Passward token has been sent to ${email}`)
    )


} catch (error) {
    user.forgotPasswardExpiryDate = undefined
    user.forgotPasswardToken = undefined

    await user.save()
    throw new  ApiError(400, error,'No user found ')
}

})

const resetPassward = asyncHandler(async(req,res,next)=>{

    // taking data from params
    const {resetToken} = req.params;

    const {passward} = req.body;
    if(!passward){
        throw new ApiError(400,"new passward is required")
    }

    // checking the resettoken with database store token 
    const forgotPasswardToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    const user = await User.findOne({
        forgotPasswardToken,
        forgotPasswardExpiryDate : {$gt:Date.now()}
    })


    if(!user){
        throw new ApiError(400,"Token is invalid or expired , please try again ")
    }


    // other wise change the passward
    user.passward = passward;
    user.forgotPasswardToken = undefined
    user.forgotPasswardExpiryDate= undefined

    user.save()

    return res.status(201).json(
        new ApiResponse(200,'Passward changed successfully')
    )


})

const updatePassward = asyncHandler(async(req,res,next)=>{
// take the old and new passward from req.body  and  user.id (because they are login )
// validating the oldpassward and new passward
// finding the data from databasea using id 
// comparing the old passward with the existing passward
// gives new passward to main passward
// save in the databasae 
// making user passward to undefined for sec



const {oldPassward,newPassward } = req.body;
const id = req.user.id;

if(!oldPassward || !newPassward) {
    throw new ApiError(400,"old and new passward are required")
}

let user = await User.findById(id).select('+passward');

if(!user){
    throw new  ApiError('400',"User not found ")
}


const isPasswardValid = await user.comparePassward(oldPassward)
if (!isPasswardValid) {
    throw new ApiError(401, "password wrong ")
}


user.passward = newPassward;


 await user.save();

 user.passward = undefined
return res.status(200).json(
    new ApiResponse(201,true,'Passward changed succesfully ')
)


})

const updateUser = asyncHandler(async(req,res,next)=>{
    // taking the username , id from fronted and params   and validation 
    // checking user exists on database or not 
    // if username they want to change then change 
    // 
    const {newUsername} = req.body;
    const {id} = req.user;
    const newAvatarFile = req.files?.avatar[0].path;

   
const user = await User.findById(id);
if(!user){
    throw new ApiError(400,'User does not exits')
}

if(newUsername){
    user.username = newUsername
}
if(newAvatarFile){
    const avatar =  await updateOnCloudinary(newAvatarFile,user.public_id);
    console.log( ' avatar  wala hai ', avatar)

if(!avatar)
{
    throw new ApiError( 400,'Avatar is required ')
}

 user.avatar={
    secure_url  :avatar?.secure_url,
    public_id  : avatar?.public_id
}

}
 await user.save();

return res.status(200).json(
    new ApiResponse (201,user,'Avatar updated successfully ')
)
    


})

export {signUp,signIn,userInfo,logout,forgotPassward,resetPassward,updatePassward,updateUser}