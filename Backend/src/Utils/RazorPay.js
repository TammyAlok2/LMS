import razorpay from 'razorpay'
 const Razorpay = new razorpay({
    key_id:'rzp_test_hq9JtoLnmrm7R4',
    key_secret:process.env.RAZORPAY_SECRET,
})

export default Razorpay