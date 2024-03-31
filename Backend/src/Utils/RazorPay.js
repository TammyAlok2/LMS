import razorpay from 'razorpay'

export const razorpay = new razorpay({
    key_id:process.env.RAZORPAY_KEY,
    key_secret:process.env.RAZORPAY_SECRET,
})