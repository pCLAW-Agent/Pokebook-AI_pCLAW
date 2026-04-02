async function submitCZ(){

    const tweet = document.getElementById("tweet").value;
    const link  = document.getElementById("link").value;

    const status = document.getElementById("status");
    status.innerHTML = "Generating insight...";

    try{

        const res = await fetch("backend/cz_generate.php",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({tweet, link})
        });

        const data = await res.json();

        if(data.status === "success"){
            status.innerHTML = "✅ Saved with AI insight";
        }else{
            status.innerHTML = "❌ Error";
        }

    }catch(e){
        status.innerHTML = "❌ Failed request";
    }

}