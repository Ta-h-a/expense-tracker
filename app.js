const express  = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const ejs = require("ejs")
const methodOverride = require('method-override');
const isLastDay = require("./lastDayOfMonth")

const app = express()

app.set('view engine','ejs')
app.set("views",__dirname+"/views")

app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// Database

const uri = 'mongodb+srv://admin-taha:'+ process.env.PASSWORD +'@cluster0.h2zkuof.mongodb.net/expenseTrackerDB?retryWrites=true&w=majority';

// const uri = "mongodb://127.0.0.1:27017/expenseTrackerDB"

mongoose.connect(uri,{useNewUrlParser: true})

const expenseSchema = new mongoose.Schema ({
    itemName : String,
    quantity : Number,
    unit : String,
    price: Number,
    note: String,
    month: String,
    createdAt: String,
    createdAtDate: String,
    modifiedAt: String,
    modifiedAtDate: String,
    isActive: Boolean,
})

const Expense = mongoose.model("Expense",expenseSchema)


// HTTPS Requests

// Home page GET request
app.get("/",function(req,res){
    
    Expense.find({isActive: true}).then(function(expenses){
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

// POST request from home page
app.post("/",function(req,res){
    // Date object for date and createdAt
    let date = new Date("2023/3/15");
    // Getting date and createdAt when item is created

    let currentDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    let createdAt = date.toLocaleTimeString();

    // Adding date and createdAt to db record
    
    const dataItem = req.body
    dataItem.createdAtDate = currentDate // Ex: '5/2/2023'
    dataItem.createdAt = createdAt // Ex: '12:00:00 AM'
    dataItem.modifiedAt = createdAt
    dataItem.modifiedAtDate = currentDate
    let findingMonth = ""
    findingMonth = findingMonth + dataItem.createdAtDate.split("/")[2] + "-" + dataItem.createdAtDate.split("/")[0]
    dataItem.month = findingMonth
    dataItem.isActive = true
    const expense = new Expense(dataItem)
    expense.save()
    res.redirect("/dashboard")
})


// Dashboard GET request
app.get("/dashboard",function(req,res){
    Expense.find({isActive: true}).then(function(expenses){
        // console.log(expenses);
        let total = 0
        let count = 0
        let quantityCount = 0
        for(record of expenses){
            quantityCount += parseInt(record.quantity)
            total += record.quantity * record.price
        }
        // console.log(quantityCount);
        const h1 = "Dashboard!📖"
        const deletedItemWord = "Deleted Items"
        const deletedItemURL = "/dashboard/deletedItems"
        const description = "This dashboard displays a comprehensive overview of your expense tracking items."
        res.render("dashboard",{
            heading: h1,
            description: description,
            items: expenses,
            quantityCount: quantityCount,
            total: total,
            count: count,
            word: deletedItemWord,
            url: deletedItemURL,
            notesSection: true
        })
    })
})

app.route("/budgets")

.get(function(req,res){
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const formattedDate = `${year}-${month}`;
    Expense.find({month:formattedDate,isActive:true}).then(function(expenses){
        // console.log(expenses);
        let total = 0
        let count = 0
        let quantityCount = 0
        for(record of expenses){
            quantityCount += parseInt(record.quantity)
            total += record.quantity * record.price
        }
    
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
        res.render("budgets",{
            currentMonth: currentMonth,
            items: expenses,
            quantityCount: quantityCount,
            total: total,
            count: count
        })
    })
})

.post(function(req,res){
    if ((req.body.monthlyExpenses)==''){
        res.send("Error 404")
        //TODO Send a 404 error page later
    }else{
        console.log(req.body.monthlyExpenses);
        Expense.find({month: req.body.monthlyExpenses, isActive: true}).then(function(expenses){
            let total = 0
            let count = 0
            let quantityCount = 0
            for(record of expenses){
                quantityCount += parseInt(record.quantity)
                total += record.quantity * record.price
            }

            // const monthString = '2023-02';
            const [year, month] = req.body.monthlyExpenses.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);

            const currentMonth = date.toLocaleString('en-US', { month: 'long' });
            res.render("budgets",{
                currentMonth: currentMonth,
                items: expenses,
                quantityCount: quantityCount,
                total: total,
                count: count
            })

        })

    }
})

app.get("/items/:itemId",function(req,res){
    const id = req.params.itemId;
    Expense.find({_id: id}).exec().then(function(item){
        res.render("item",{
            item: item[0]
        })
    }).catch((err)=>{
        console.log(err);
        res.send("Item is invalid or no longer exists")
    })
})

app.post("/items/:modifiedItem",function(req,res){
    const updatedItem = req.body
    const modifiedAt = new Date().toLocaleTimeString();
    const modifiedAtDate = new Date().toLocaleDateString();
    Expense.updateOne(
        {
            _id: req.params.modifiedItem
        },
        {
            itemName: updatedItem.itemName,
            quantity: updatedItem.quantity,
            price: updatedItem.price,
            note: updatedItem.note,
            modifiedAt: modifiedAt,
            modifiedAtDate: modifiedAtDate
        }
    ).exec()
    res.redirect("/items/"+req.params.modifiedItem)
})


app.post("/items/:modifiedItem/delete",function(req,res){
    Expense.updateOne(
        {
            _id: req.params.modifiedItem
        },
        {
            isActive: false,
        }
    ).exec().then(function(item){
        console.log(item);
        res.redirect("/dashboard")
    })
})

app.get("/dashboard/deletedItems",function(req,res){
    Expense.find({isActive: false}).then(function(expenses){
        // console.log(expenses);
        let total = 0
        let count = 0
        let quantityCount = 0
        for(record of expenses){
            quantityCount += parseInt(record.quantity)
            total += record.quantity * record.price
        }
        // console.log(quantityCount);
        const description = "This dashboard displays a comprehensive overview of deleted items."

        res.render("dashboard",{
            heading: "Deleted Items",
            items: expenses,
            description: description,
            quantityCount: quantityCount,
            total: total,
            count: count,
            word: "Dashboard!📖",
            url: "/dashboard",
            notesSection: false
        })
    })
})

// For local server
app.listen(3000,()=>{
    console.log("Server has started on port 3000");
})
