const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));


const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);


app.listen(3000,()=>{
    console.log(
        "Server running http://localhost:3000"
    );
});