const express = require('express');
const router = express.Router();

const db = require('../config/db');
const bcrypt = require('bcrypt');


// ======================
// REGISTER
// ======================
router.post('/register', async(req,res)=>{

    try {

        const {
            nama,
            email,
            password,
            confirmPassword
        } = req.body;


        // cek data kosong
        if(!nama || !email || !password || !confirmPassword){

            return res.status(400).json({
                message:"Data belum lengkap"
            });

        }


        // cek password
        if(password !== confirmPassword){

            return res.status(400).json({
                message:"Password tidak sama"
            });

        }


        // cek email sudah ada
        const [cekUser] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );


        if(cekUser.length > 0){

            return res.status(400).json({
                message:"Email sudah terdaftar"
            });

        }


        // enkripsi password
        const hashPassword = await bcrypt.hash(password,10);



        // simpan user
        const sql = `
            INSERT INTO users
            (nama,email,password)
            VALUES (?,?,?)
        `;


        await db.query(sql,[
            nama,
            email,
            hashPassword
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