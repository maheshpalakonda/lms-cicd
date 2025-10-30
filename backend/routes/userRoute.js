import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser, UpdateProfile, addToWishlist, removeFromWishlist, getWishlist } from "../controllers/userController.js"
import { getNotifications, markAsRead } from "../controllers/notificationController.js"
import upload from "../middlewares/multer.js"



let userRouter = express.Router()

userRouter.get("/currentuser",isAuth,getCurrentUser)
userRouter.post("/updateprofile",isAuth,upload.single("photoUrl"),UpdateProfile)
userRouter.post("/addtowishlist",isAuth,addToWishlist)
userRouter.post("/removefromwishlist",isAuth,removeFromWishlist)
userRouter.get("/wishlist",isAuth,getWishlist)

// Notifications routes
userRouter.get("/notifications", isAuth, getNotifications)
userRouter.post("/notifications/:id/read", isAuth, markAsRead)

export default userRouter
