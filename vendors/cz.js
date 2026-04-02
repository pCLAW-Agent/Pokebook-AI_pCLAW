async function loadCZ(){

    const feed = document.getElementById("czFeed");

    try{
        const res = await fetch("backend/cz_data.php");
        const data = await res.json();

        if(!data.length){
            feed.innerHTML = "<p>No data yet</p>";
            return;
        }

        let html = "";

        data.forEach(item => {

            html += `
            <div class="cz-card">

                <div class="cz-tweet">
                <p style="color:#ffaf00">CZ ARCHIVE TWEET :</p> ${item.tweet}
                </div>

                <div class="cz-insight">
                🧠 INSIGHT : ${item.insight}
                </div>

                <div class="cz-impact">
                📈 IMPACT : ${item.impact}
                </div>

                <div class="cz-meta">
                    <span>${item.date}</span>
                    <a href="${item.link}" target="_blank" class="cz-link">
                        View on X
                    </a>
                </div>

            </div>
            `;

        });

        feed.innerHTML = html;

    }catch(err){
        feed.innerHTML = "<p>Error loading data</p>";
    }

}