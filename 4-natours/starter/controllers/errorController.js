const sendErrorDev =(err, res)=>{
  // Operational. trusted error: Send message to client
  res.status(err.statusCode).json({
    stauts: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

const sendErrorProd = (err, res)=>{
  // Operational, trusted error: send message to client
  if(err.isOperational){
    res.status(err.statusCode).json({
      stauts: err.status,
      message: err.message,
    });
    // Programming or other unknown error: do't leak error details
  }else{
    // 1) Log Error
    console.log('ERROR 🔥:', err);

    // 2) Send generic message
    res.status(500).json({
      status:'error',
      message: 'Something went very wrong..!'
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err.res);
  }
};
