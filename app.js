if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const Listing=require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

//const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

//const{listingSchema,reviewSchema}=require("./schema.js");
//const Review=require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter=require("./routes/user.js");
//validaataion check schema
const session=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl=process.env.ATLASDB_URL;
main()
  .then((res) => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dburl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store=MongoStore.create({
  mongoUrl: dburl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});
store.on("error",()=>{
  console.log("ERROR IN mongo session store",err);
});
const sessionOptions={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized:true,
 cookie:{
  expires:Date.now()+7*24*60*60*1000,
  maxAge:7*24*60*60*1000,
  httpOnly:true
 },
};


//app.get("/", (req, res) => {
  //res.send("hi am working");
//});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req,res,next)=>{
 res.locals.success=req.flash("success");
 res.locals.error=req.flash("error");
 res.locals.currUser=req.user;
next();
})





app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);


/*
const validateListing=(req,res,next)=>{
  let {error}=listingSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,errMsg);
  }else{
    next();
  }
 };

 const validateReview=(req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);
  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
   throw new ExpressError(400,errMsg);
  }else{
    next();
  }
 };
*/
/*
app.get("/listings",wrapAsync(async(req,res)=>{
  const allListing = await Listing.find({});
  res.render("\listings/index.ejs",{allListing});
}));
app.get("/listings/new",(req,res)=>{
  res.render("\listings/new.ejs");
 });

//validation eeror for schema







 //create route

 //schema.js se error check hoge for validation eror of schema
 //validateListing se
 app.post("/listings",validateListing,wrapAsync(async(req,res)=>{
  //let listing=req.body.listing;
 // console.log(listing);

 //check gor schema validation

  const newListing=new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
 
 }));


 app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
  let{id}=req.params;
 
  const listing= await Listing.findById(id);
  res.render("\listings/edit.ejs",{listing});

 }));



 app.get("/listings/:id",wrapAsync(async(req,res)=>{
let{id}=req.params;

 const listing= await Listing.findById(id).populate('reviews');
 res.render("listings/show.ejs",{listing});
 }));

app.put("/listings/:id",validateListing,wrapAsync(async(req,res)=>{
  let{id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing});
   res.redirect(`/listings/${id}`);
}));
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
  let{id}=req.params;
   await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));


//app.get("/testListing",async (req,res)=>{
//let sampleListing= new Listing({
  //title:"My New Villa",
  //description:"By the Beach",
 // price:1200,
 // location:"Calangute,Goa",
 // country:"India",
//});
//await sampleListing.save();
 
// console.log("succesful");
 //res.send("succ testing");
//});
*/
/*
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{

  let listing=await Listing.findById(req.params.id);
  let newReview= new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
  }));
  //delete review route
  app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    console.log(req.params.id);
    console.log(req.params.reviewId);
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  }));
  
*/


/*
app.use((err,req,res,next)=>{
let{statusCode=500,message="something went wrong!"}=err;
res.status(statusCode).render("error.ejs",{message});
//res.status(statusCode).send(message);
});
*/
//Reviews
//posts
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
