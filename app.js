const express  = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const ejs = require("ejs")

const app = express()

app.set('view engine','ejs')
app.set("views",__dirname+"/views")

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


// Database

const uri = 'mongodb+srv://admin-taha:cKDw4VAcUryeNpZy@cluster0.h2zkuof.mongodb.net/expenseTrackerDB?retryWrites=true&w=majority';

mongoose.connect(uri,{useNewUrlParser: true})

const expenseSchema = new mongoose.Schema ({
    itemName : String,
    quantity : Number,
    unit : String,
    category: String,
    price: Number,
    note: String
})

const Expense = mongoose.model("Expense",expenseSchema)


// HTTPS Requests

app.get("/",function(req,res){
    
    Expense.find({}).then(function(expenses){
        let total = 0
        for(record of expenses){
            total += record.quantity * record.price
        }
        // console.log(quantityCount);
        res.render("home",{
            total: total
        })
    })

})

// Total Expense


/**
 itemName
quantity
unit
category
price
note

 */


app.post("/",function(req,res){
    // console.log(req.body)
    // totalExpense += parseInt(req.body.price)
    // console.log(totalExpense)
    const dataItem = req.body
    
    const expense = new Expense(dataItem)
    expense.save()
    
    res.redirect("/dashboard")
})

app.get("/dashboard",function(req,res){
    Expense.find({}).then(function(expenses){
        // console.log(expenses);
        let total = 0
        let count = 0
        let quantityCount = 0
        for(record of expenses){
            quantityCount += parseInt(record.quantity)
            total += record.quantity * record.price
        }
        // console.log(quantityCount);

        res.render("dashboard",{
            items: expenses,
            qualityCount: quantityCount,
            total: total,
            count: count
        })
    })
})



app.listen(3000,()=>{
    console.log("Server has started on port 3000");
})
