import Product from "../models/product.schema"
import formidable from "formidable"
import fs from "fs"
import {deleteFile, s3FileUpload} from "../services/imageUpload"
import Mongoose from "mongoose"
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'
import config from "../config"

/************************************************************* 
* @ADD_PRODUCT
* @route http://localhost:5000/api/product
* @description COntroller used for creating a new product
* @description only admin can create the coupon
* @description Uses aws s3 bucket for image upload
* @return Product Object
*************************************************************/

export const addProduct = asyncHandler(async (req, res) => {
    
    const form = formidable({
        multiples: true,
        keepExtensions: true
    })

    form.parse(req, async function (err, fields, files){
        try {
            if(err){
                throw new CustomError(err.message || "SOmething went wrong", 500)
            }
            //generating id for mongoose : _id
            let productId = new Mongoose.Types.ObjectId().toHexString()
            
            // console.log(fields, files)

            if(!fields.name || !fields.price || !fields.description || !fields.collectionId){
                throw new CustomError("Please fill all details", 500)
            }

            //handling images
            let imgArrayResp = Promise.all(
                // accessing all filekey from (filekey: value)
                Object.keys(files).map(async (filekey, index) => {
                    const element = files[filekey]
                    
                    // getting the actual path of image in the uploader's system
                    const data = fs.readFileSync(element.filepath)
                    
                    //uploading each image in s3 bucket
                    const upload = await s3FileUpload({
                        bucketName: config.S3_BUCKET_NAME,
                        key:    `products/${productId}/photo_${index + 1}.png`,
                        body: data,
                        contentType: element.mimetype
                    })
                    s3
                    return {
                        //upload.Location gives location of your bucket
                        secure_url: upload.Location
                    }
                })
            )

            let imgArray = await imgArrayResp;

            //uploading each product to mongoose db 
            const product = await Product.create({
                _id: productId,
                photos: imgArray,
                ..fields,
            })

            if(!product){
                throw new CustomError("Product was not created", 400)
                res.status(200).json({
                    success:true,
                    product
                })
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "SOmething went wrong in creating the product"
            })
        }
    })
})