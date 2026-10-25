import express from "express"
let app = express();
import mysql2 from "mysql2"
import dotenv from "dotenv"

dotenv.config();
let config = process.env.DB_URL
var mysql=mysql2.createConnection(config);

app.use(express.json());
mysql.connect(function(err){
    if(err==null)
    {
        console.log("connected to database successfully");
    }
    else
     console.log(err.message);
})

app.listen(2007,()=>{
    console.log("Server listening on port 2007")
})

app.post("/bookSeat",(req,res)=>{

    let seatId = req.body.seatId;
    let roll_no = req.body.roll;
    let name = req.body.name;
    let start = req.body.start;
    let end = req.body.end;
    let status = req.body.status;
    let userId = req.body.userId;
    
    mysql.query("insert into bookings values(?,?,?,?,?,?,?)",[seatId,roll_no,name,start,end,status,NOW(),NULL]),function(err){
        if(err == null)
            res.json({status:true,msg:"Seat reserved successfully"})
        else 
            res.json({status:false,err})
    }

});





