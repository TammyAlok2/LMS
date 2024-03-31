
import express, { Router } from 'express'
import {  signIn, signUp, userInfo,logout, forgotPassward, resetPassward, updatePassward, updateUser } from '../Controllers/auth.Controller.js'
import { isLoggedIn } from '../Middlewares/jwtAuth.js'
import { upload } from '../Middlewares/multer.middleware.js'

const router = Router()

router.route('/signUp').post(
    upload.fields(
        [{name:"avatar",maxCount:1}])
    ,signUp)

router.route('/signIn').post(signIn)

router.route('/user').get(isLoggedIn,userInfo)

router.route('/logout').get(isLoggedIn,logout);

router.route('/reset').post(forgotPassward)

router.route('/reset/:resetToken').post(resetPassward)

router.route('/update-passward').post( isLoggedIn,updatePassward)

router.route('/update').put(isLoggedIn , upload.fields([{name:"avatar",maxCount:1}]) ,updateUser)

export default router 