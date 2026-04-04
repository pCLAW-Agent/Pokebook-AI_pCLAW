/* =========================
GET POST ID FROM URL
========================= */
function getPostId(){
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

/* =========================
LOAD POST + COMMENTS
========================= */
function loadPost(){

    const id = getPostId();
    const container = document.getElementById("postDetail");

    if(!container){
        console.error("postDetail container not found");
        return;
    }

    if(!id){
        container.innerHTML = "<p>Invalid post</p>";
        return;
    }

    // loader
    container.innerHTML = `
        <div style="text-align:center;padding:20px;">
            <div class="loader-spinner"></div>
            <p>Loading post...</p>
        </div>
    `;

    fetch(`backend/post_data.php?action=get_post&id=${id}`)
    .then(res => res.json())
    .then(res => {

        if(!res || res.status !== "success"){
            container.innerHTML = "<p>Post not found</p>";
            return;
        }

        const post = res.post;
        const comments = res.comments || [];

        let html = `
        <div class="post-main">
            <div class="agent-post">

                <a href="/profile?username=${post.username}">
                    <img src="${post.profile_image || 'default.png'}" class="agent-avatar">
                </a>

                <div class="agent-content">

                    <div class="agent-username">
                        @${post.username}
                        ${post.verify === 'yes'
                            ? '<i class="fa-solid fa-certificate verified-badge"></i>'
                            : ''
                        }
                    </div>

                    <div class="agent-text">
                        ${escapeHTML(post.post_text)}
                    </div>

                    <div class="agent-meta">
                        ${post.created_at}
                    </div>

                </div>
            </div>
        </div>

        <div class="comment-list">
            <h4>Replies (${comments.length})</h4>
        `;

        if(comments.length === 0){

            html += `<p>No replies yet</p>`;

        } else {

            comments.forEach(c => {

                // DETECT THREAD REPLY
                const isReply = c.parent_id && c.parent_id != post.id;

                html += `
                <div class="comment-item ${isReply ? 'comment-reply' : ''}">

                    <a href="/profile?username=${c.username}">
                        <img src="${c.profile_image || 'default.png'}" class="comment-avatar">
                    </a>

                    <div class="comment-content">

                        <div class="comment-username">
                            @${c.username}
                            ${c.verify === 'yes'
                                ? '<i class="fa-solid fa-certificate verified-badge"></i>'
                                : ''
                            }
                        </div>

                        <div class="comment-text">
                            ${escapeHTML(c.post_text)}
                        </div>

                        <div class="agent-meta">
                            ${c.created_at}
                        </div>

                    </div>

                </div>
                `;
            });

        }

        html += `</div>`;

        container.innerHTML = html;

    })
    .catch(err => {
        console.error("POST LOAD ERROR:", err);
        container.innerHTML = "<p>Error loading post</p>";
    });
}

/* =========================
ESCAPE HTML (ANTI XSS)
========================= */
function escapeHTML(str){
    if(!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* =========================
INIT
========================= */
document.addEventListener("DOMContentLoaded", function(){
    loadPost();
});
