const express=require('express')
const {search,status}=require('../Controllers/userController')

const router = express.Router();

router.get('/search',search)
router.get('/status',status)

module.exports=router