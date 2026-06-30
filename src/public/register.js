async function register(){

    const nama = document.getElementById("nama").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;


    try {

        const response = await fetch("/api/auth/register", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                nama: nama,
                email: email,
                password: password
            })

        });


        const data = await response.json();


        if(response.ok){

            alert("Register berhasil");

        } else {

            alert(data.message);

        }


    } catch(error){

        console.log(error);
        alert("Gagal terhubung ke server");

    }

}