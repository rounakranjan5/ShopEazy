if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}



const express=require('express');
const app=express();
const path=require('path');
const mongoose=require('mongoose');
const seedDB=require('./seed');
const ejsMate=require('ejs-mate');
const methodOverride=require('method-override')
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/User');
const MongoStore = require('connect-mongo');


// const dbURL = process.env.dbURL || 'mongodb://localhost:27017/shop-eazy';
const dbURL = process.env.dbURL || "mongodb+srv://rounakranjanjha:LYZtljlPfZiNLAEP@cluster0.8z638.mongodb.net/shopeazy";


mongoose.set('strictQuery', true);
mongoose.connect(dbURL)
    .then(() => console.log('DB Connected'))
    .catch((err) => console.log(err));


    app.engine('ejs', ejsMate);
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));
    

    let secret = process.env.SECRET || 'weneedabettersecretkey';


    let store = MongoStore.create({
        secret:secret,
        mongoUrl: dbURL,
        touchAfter:24*60*60
    })
    
    const sessionConfig = {
        store:store,
        name:'bhaukaal',
        secret: secret,
        resave: false,
        saveUninitialized: true,
        cookie:{
            httpOnly:true,
            expires:Date.now() + 1000*60*60*24*7,
            maxAge: 1000*60*60*24*7
        }
    }
    
    

    app.use(session(sessionConfig));
    app.use(flash());
    
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    
    
    passport.use(new LocalStrategy(User.authenticate()));
    
    
    app.use((req, res, next) => {
        res.locals.currentUser = req.user;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    })
    
    

//seeding initial products to the db
// seedDB()

// Routes require
// Routes require
const productRoutes = require('./routes/product');
const reviewRoutes = require('./routes/review');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const productApi = require('./routes/api/productapi');
const paymentRoutes = require('./routes/payment');


app.get('/' , (req,res)=>{
    res.render('home');
})

// middle express
app.use(productRoutes);
app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(productApi);
app.use(paymentRoutes);


const port = 8080;

app.listen(port, () => {
    console.log(`server running at port ${port}`);
});