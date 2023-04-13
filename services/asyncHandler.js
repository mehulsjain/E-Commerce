const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 500)
        // res.json({
        //     success: false,
        //     message: error.message
        // })
    }
    next()
}

module.exports = asyncHandler;


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {

//     }catch(err){
    
//     }
// }

// this is equivalent to 

// function asyncHandler(fn){
//     return async function(req, res, next){
//         try{

//         }catch(err){

//         }
//     }
// }