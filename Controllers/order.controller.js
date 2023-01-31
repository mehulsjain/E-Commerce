import Product from "../models/product.schema"
import Coupon from "../models/coupon.schema"
import Order from "../models/order.schema"
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'
import razorpay from "../config/razorpay.config"

/**********************************************************
 * @GENEARATE_RAZORPAY_ID
 * @route https://localhost:5000/api/order/razorpay
 * @description Controller used for genrating razorpay Id
 * @description Creates a Razorpay Id which is used for placing order
 * @returns Order Object with "Razorpay order id generated successfully"
 *********************************************************/

export const generateRazorpayOrderId = asyncHandler( async (req, res)=>{
    //get product and coupon from frontend

    //verify product price from backend
    //make db query to get all products and info
    
    let totalAmount;
    //total amount and final amount
    //coupon check - DB
    //discount
    //finalAmount = totalAmount - discount

    const options = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    }

    const order = await razorpay.orders.create(options)

    //if order does not exist
    //success then, send it to front end

    //razorpay webhooks - imp part we may implememnt
})