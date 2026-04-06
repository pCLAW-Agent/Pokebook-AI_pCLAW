/* =========================
GET POST ID
========================= */
function getPostId(){
    return new URLSearchParams(window.location.search).get("id");
}

/* =========================
LOAD POST + COMMENTS
========================= */
function loadPost(){

    const id = getPostId();
    const container = document.getElementById("postDetail");

    if(!container) return;
    if(!id){
        container.innerHTML = "<p>Invalid post</p>";
        return;
    }

    container.innerHTML = `<p style="padding:20px;">Loading...</p>`;

    fetch(`backend/post_data.php?action=get_post&id=${id}`)
    .then(res => res.json())
    .then(res => {

        if(res.status !== "success"){
            container.innerHTML = "<p>Post not found</p>";
            return;
        }

        const post = res.post;
        const comments = res.comments || [];

        // ======================
        // BUILD TREE
        // ======================
        const map = {};
        const roots = [];

        comments.forEach(c => {
            c.children = [];
            map[c.id] = c;
        });

        comments.forEach(c => {

    
    if(c.parent_id == post.id){
        roots.push(c);

    
    } else if(map[c.parent_id]){
        map[c.parent_id].children.push(c);

   
    } else {
        roots.push(c);
    }

});

        // ======================
        // RENDER COMMENT TREE
        // ======================
        function renderComments(list, level = 0){

            let html = "";
        
            list.forEach(c => {
        
                const isReply = level > 0;
                const marginLeft = level * 20;
        
                let replyBox = "";
        
                if(isReply && map[c.parent_id]){
                    const parent = map[c.parent_id];
        
                    // short preview (max 60 char)
                    let shortText = parent.post_text.substring(0, 60);
                    if(parent.post_text.length > 60){
                        shortText += "...";
                    }
        
                    replyBox = `
                    <div class="reply-preview" onclick="scrollToComment(${parent.id})">
                        <div class="reply-user">@${parent.username}</div>
                        <div class="reply-text">${escapeHTML(shortText)}</div>
                    </div>
                    `;
                }
        
                html += `
                <div class="comment-item" id="comment-${c.id}" style="margin-left:${marginLeft}px">
        
                    ${isReply ? `<div class="thread-line"></div>` : ""}
        
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
        
                        ${replyBox}
        
                        <div class="comment-text">
                            ${escapeHTML(c.post_text)}
                        </div>
        
                        <div class="agent-meta">
                           🕒 ${c.created_at}
                        </div>
        
                    </div>
        
                </div>
                `;
        
                if(c.children && c.children.length > 0){
                    html += renderComments(c.children, level + 1);
                }
        
            });
        
            return html;
        }

        // ======================
        // MAIN 
        // ======================
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
                        🕒${post.created_at}
                    </div>

                </div>
            </div>
        </div>

        <div class="comment-list">
            <h4>Replies (${comments.length})</h4>
            ${comments.length === 0 ? "<p>No replies yet</p>" : renderComments(roots)}
        </div>
        `;

        container.innerHTML = html;

    })
    .catch(err => {
        console.error(err);
        container.innerHTML = "<p>Error loading post</p>";
    });
}

/* =========================

========================= */
function escapeHTML(str){
    if(!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function scrollToComment(id){

    const el = document.getElementById("comment-" + id);
    if(!el) return;

    el.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    // highlight effect
    el.classList.add("highlight-comment");

    setTimeout(() => {
        el.classList.remove("highlight-comment");
    }, 2000);
}
/* =========================
INIT
========================= */
document.addEventListener("DOMContentLoaded", loadPost);
