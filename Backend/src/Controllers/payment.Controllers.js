import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import  razorpay  from "../Utils/RazorPay.js";
import { User } from "../Models/User.Models.js";
import crypto from 'crypto'


const getRazorpayApiKey = asyncHandler(async(req,res,next)=>{

    res.status(200).json(
        {
            success:true,
            message:"Razorpay API Key",
            key:'rzp_test_hq9JtoLnmrm7R4'
        }
    )

})

const buySubscription = asyncHandler(async(req,res,next)=>{

    const id = req.user.id;
    console.log(id)
    const user = await User.findById(id);// get   the loggedin user details and validation

    if(!user){
        throw new ApiError(400,'Unauthorized ,please login')
    }
    if(user.role ==="ADMIN"){
        throw new ApiError(400,"Admin cannot purchase aa subscription")
    }

    const subscription = await razorpay.subscriptions.create({
plan_id:'plan_NtL0ui655xAL0L',
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

    const {razorpay_payment_id, razorpay_signature,razorpay_subscription_id} = req.body ;

    const user =  await User.findById(id);

    if(!user){
        throw new ApiError(400,'User does not exists')
    }

    const subscriptionId = user.subscription.id;

    // to verify 

    const generatedSignature = crypto
    .createHmac('sha256','rd8mx8Ymaoh5C8HNYsXnNkDx')
    .update(`${razorpay_payment_id} | ${subscriptionId}`)
    .digest('hex')

    if(generatedSignature !== razorpay_signature){
        throw new ApiError(403,"payment not verfied ")
    }

     await Payment.crete({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id
     })

     user.subscription.status = 'active';
     await user.save();

     return res.status(200).json(
        new ApiResponse(201,true,'Payment done successfully')
     )
    
})


const cancelSubscription = asyncHandler(async(req,res,next)=>{
    
const {id} = req.user;

const user = await User.findById(id);

if(!user){
    throw new ApiError(400,'Unauthorized ,please login')
}
if(user.role ==="ADMIN"){
    throw new ApiError(400,"Admin cannot purchase aa subscription")
}

const subscriptionId = user.subscription.id;

const subscription = await razorpay.subscriptions.cancel(subscriptionId)

user.subscription.status = subscription.status;

await user.save();



})


const allPayments = asyncHandler(async(req,res,next)=>{

    const {count } = req.query ;
    const subscriptions = await razorpay.subscriptions.all({
        count:count || 10
    }
    )

    return res.status(200).json(
        new ApiResponse(201,subscriptions,'Payments fetched successfully')
    )

    
})


export {getRazorpayApiKey,buySubscription,verifySubscription,cancelSubscription,allPayments}