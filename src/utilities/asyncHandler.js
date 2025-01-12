const asyncHandler = (func) => {
    return (req, res, next) => {
        return Promise.resolve(func(req, res, next)).catch(err => {next(err)}) ;
    }
}

export { asyncHandler };

// const asyncHandler = (fn) => {
//     return async (res, req, next) => {
//         try {
//             await fn(req, res, next);
//         } catch (err) {
//             res.status(err.code || 500).json({
//                 succes: false,
//                 message: err.message
//             })
//         }
//     }
// }