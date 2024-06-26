import { Schema } from "mongoose";

const paymentSchema = new Schema({
    razorpay_payment_id:{
        type:String,
        required:true
    },
    razorpay_subscripiton_id:{
        type:String,
        required:true,
    },
    razorpay_signature:{
        type:String,
        required:true,
    }


},
{
    timestamps:true
})

export const Payment = mongoose.model("Payment",paymentSchema)