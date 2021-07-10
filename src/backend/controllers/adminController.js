const User = require('../models/userModel');
// const multer = require('multer');
// const path = require('path');

const getUsers = async (req, res, next) =>{
    
   let doc =   await User.find();
//    console.log('users =' , doc);
   res.locals.doc = doc;
   next();
}
const changeUserRole = async (req, res, next)=>{
    const email = req.params.id
    const newRole = req.body.newRole
    console.log(newRole)
    let user = await User.findOneAndUpdate({email : email},{
        role :  newRole
    },(err, data)=>{
         if(err) throw err;
         console.log(data, "Role Updated")
    })
    res.redirect('/admin')
}

module.exports = {
    getUsers : getUsers,
    changeUserRole : changeUserRole
}


