const express = require('express');
const router = express.Router();

const db = require('../config/db');


// REGISTER
router.post('/register', async(req,res)=>{

    try {

        const {
            nama,
            email,
            password
        } = req.body;


        if(!nama || !email || !password){

            return res.status(400).json({
                message:"Data belum lengkap"
            });

        }


        const sql = `
            INSERT INTO users
            (nama,email,password)
            VALUES (?,?,?)
        `;


        await db.query(sql,[
            nama,
            email,
            password
        ]);


        res.status(201).json({
            message:"Register berhasil"
        });


    } catch(error){


        console.log("REGISTER ERROR:",error);


        res.status(500).json({
            message:error.message
        });

    }

});


module.exports = router;