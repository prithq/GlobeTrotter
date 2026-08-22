import express from "express"
const app=express()


app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

app.get("/health",(req,res)=>{
    res.send("working")
})
app.use(8000)

export default app
