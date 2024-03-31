import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { razorpay } from "../Utils/RazorPay.js";
import { User } from "../Models/User.Models.js";


const getRazorpayApiKey = asyncHandler(async(req,res,next)=>{

    res.status(200).json(
        {
            success:true,
            message:"Razorpay API Key",
            key:process.env.RAZORPAY_KEY_ID
        }
    )

})

const buySubscription = asyncHandler(async(req,res,next)=>{

    const {id} = req.user;
    const user = await User.findById(id);// get   the loggedin user details and validation

    if(!user){
        throw new ApiError(400,'Unauthorized ,please login')
    }
    if(user.role ==="ADMIN"){
        throw new ApiError(400,"Admin cannot purchase aa subscription")
    }

    const subscription = await razorpay.subscription.create({
plan_id:process.env.RAZORPAY_PLAN_ID,
custormer_notify:1
    })

    // changing user information 
    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status

    await user.save()

    return res.status(201).json(
         new ApiResponse(201,subscription,"Successfully subscribed")
    )
    
})


const verifySubscription= asyncHandler(async(req,res,next)=>{

    const {id} = req.user;

    const {razor}
    
})


const cancelSubscription = asyncHandler(async(req,res,next)=>{
    
})


export {getRazorpayApiKey,buySubscription,verifySubscription,cancelSubscription}