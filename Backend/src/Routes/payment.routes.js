
import {Router} from 'express'
import { authorizeRoles, isLoggedIn } from '../Middlewares/jwtAuth.js'
import { getRazorpayApiKey,buySubscription,verifySubscription,cancelSubscription,allPayments } from '../Controllers/payment.Controllers.js'
const router = Router()

router
.route('/razorpay-key')
.get(getRazorpayApiKey)


router
.route('/subscribe')
.post( isLoggedIn , buySubscription)

router
.route('/verify')
.post(  isLoggedIn,verifySubscription)

router
.route('/unsubscribe')
.post( isLoggedIn,cancelSubscription)

router
.route('/')
.get( isLoggedIn,authorizeRoles("ADMIN"),allPayments)

export default router