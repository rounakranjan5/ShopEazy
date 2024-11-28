const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../middleware');
const Product = require('../models/Product');
const User = require('../models/User');

const stripe = require('stripe')('sk_test_tR3PYbcVNZZ796tH88S4VQ2u');



router.get('/user/cart' , isLoggedIn , async(req,res)=>{
    const user = await User.findById(req.user._id).populate('cart');
    const totalAmount = user.cart.reduce((sum , curr)=> sum+curr.price , 0)
    const productInfo = user.cart.map((p)=>p.desc).join(',');
    res.render('cart/cart' , {user, totalAmount , productInfo });
})


router.post('/user/:productId/add' , isLoggedIn , async(req,res)=>{
    let {productId} = req.params;
    let userId = req.user._id;
    let product = await Product.findById(productId);
    let user = await User.findById(userId);
    user.cart.push(product);
    await user.save();
    res.redirect('/user/cart'); 
})

router.get("/product/payment",async (req,res)=>{
    // let {id}=req.params;
    // let user=await User.findById(id).populate("cart");
    let user=req.user;
    let products=await User.findById({_id:user._id}).populate("cart");
    const session = await stripe.checkout.sessions.create({
        line_items: Array.from(products.cart).map((item)=>{
            return {
                price_data:{
                    currency:"INR",
                    product_data:{
                        name:`${item.name}`,
                    },
                    unit_amount:item.price*100,
                },
                quantity:1,
            };
        }),

        mode: "payment",
        // success_url: '../views/success',
        success_url:"http://localhost:8080/success",
        cancel_url:"http://localhost:8080/cancel",

        // cancel_url: '../views/cancel',
      });
    
      res.redirect(303, session.url);
    
})

module.exports = router;