document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("register-form");


    if(registerForm){

        registerForm.addEventListener("submit", async function(e){

            e.preventDefault();


            const nama = document.getElementById("nama").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;


            const errorMessage = document.getElementById("error-message");


            if(password !== confirmPassword){

                errorMessage.innerHTML =
                "Password dan konfirmasi password tidak sama";

                return;

            }


            try {


                const response = await fetch(
    "/api/auth/register",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },


        body:JSON.stringify({

            nama:nama,
            email:email,
            password:password,
            confirmPassword:confirmPassword

        })

    }
);

                const data = await response.json();



                if(response.ok){


                    alert("Register berhasil");

                    window.location.href="./login.html";


                }else{


                    errorMessage.innerHTML = data.message;


                }



            }catch(error){


                console.log(error);

                errorMessage.innerHTML =
                "Server tidak dapat dihubungi";


            }


        });

    }

});