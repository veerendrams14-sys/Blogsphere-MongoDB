// ============================================================
// BLOGSPHERE - MAIN JAVASCRIPT
// ============================================================


// ============================================================
// BACKEND URL
// ============================================================

const API_URL = "http://localhost:5000";


// ============================================================
// BLOGSPHERE - REGISTER
// ============================================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // Get form values

            const name =
                document.getElementById("name")
                    .value
                    .trim();

            const email =
                document.getElementById("email")
                    .value
                    .trim();

            const password =
                document.getElementById("password")
                    .value;

            const confirmPassword =
                document.getElementById("confirmPassword")
                    .value;


            // ====================================================
            // PASSWORD VALIDATION
            // ====================================================

            if (password !== confirmPassword) {

                alert("Passwords do not match.");

                return;

            }


            if (password.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;

            }


            // ====================================================
            // SEND REGISTER DATA TO BACKEND
            // ====================================================

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/auth/register`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                password: password

                            })

                        }
                    );


                const data =
                    await response.json();


                // ====================================================
                // BACKEND ERROR
                // ====================================================

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Registration failed."
                    );

                    return;

                }


                // ====================================================
                // SUCCESS
                // ====================================================

                alert(
                    data.message ||
                    "Registration successful!"
                );


                // Go to login page

                window.location.href =
                    "login.html";

            }


            catch (error) {

                console.error(
                    "Registration Error:",
                    error
                );


                alert(
                    "Unable to connect to the backend. Please make sure the server is running."
                );

            }

        }
    );

}


// ============================================================
// BLOGSPHERE - LOGIN
// ============================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    .value;


            // ====================================================
            // SEND LOGIN REQUEST TO BACKEND
            // ====================================================

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/auth/login`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                password: password

                            })

                        }
                    );


                const data =
                    await response.json();


                // ====================================================
                // LOGIN FAILED
                // ====================================================

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Invalid email or password."
                    );

                    return;

                }


                // ====================================================
                // LOGIN SUCCESS
                // ====================================================

                localStorage.setItem(
                    "blogSphereLoggedIn",
                    "true"
                );


                // Save logged-in user if backend sends one

                if (data.user) {

                    localStorage.setItem(
                        "blogSphereCurrentUser",
                        JSON.stringify(data.user)
                    );

                }


                alert(
                    data.message ||
                    "Login successful!"
                );


                window.location.href =
                    "dashboard.html";

            }


            catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                alert(
                    "Unable to connect to the backend. Please make sure the server is running."
                );

            }

        }
    );

}


// ============================================================
// BLOGSPHERE - CREATE BLOG
// ============================================================

const blogForm =
    document.getElementById("blogForm");


if (blogForm) {


    // ============================================================
    // CHECK IF EDITING A DRAFT
    // ============================================================

    const editingDraftId =
        localStorage.getItem(
            "editingDraftId"
        );


    // ============================================================
    // LOAD DRAFT INTO FORM
    // ============================================================

    if (editingDraftId) {

        const drafts =
            JSON.parse(
                localStorage.getItem(
                    "blogSphereDrafts"
                )
            ) || [];


        const draft =
            drafts.find(
                function (item) {

                    return item.id ===
                        Number(editingDraftId);

                }
            );


        if (draft) {

            const titleInput =
                document.getElementById(
                    "blogTitle"
                );

            const categoryInput =
                document.getElementById(
                    "category"
                );

            const tagsInput =
                document.getElementById(
                    "tags"
                );

            const contentInput =
                document.getElementById(
                    "content"
                );


            if (titleInput) {

                titleInput.value =
                    draft.title || "";

            }


            if (categoryInput) {

                categoryInput.value =
                    draft.category || "";

            }


            if (tagsInput) {

                tagsInput.value =
                    draft.tags || "";

            }


            if (contentInput) {

                contentInput.value =
                    draft.content || "";

            }

        }

    }


    // ============================================================
    // PUBLISH BLOG
    // ============================================================

    blogForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ====================================================
            // GET BLOG DATA
            // ====================================================

            const title =
                document.getElementById(
                    "blogTitle"
                ).value.trim();


            const category =
                document.getElementById(
                    "category"
                ).value;


            const tags =
                document.getElementById(
                    "tags"
                ).value.trim();


            const content =
                document.getElementById(
                    "content"
                ).value.trim();


            // ====================================================
            // VALIDATION
            // ====================================================

            if (
                !title ||
                !category ||
                !content
            ) {

                alert(
                    "Please fill in all required fields."
                );

                return;

            }


            // ====================================================
            // SEND BLOG TO BACKEND
            // ====================================================

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/blogs`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                title: title,

                                category: category,

                                tags: tags,

                                content: content

                            })

                        }
                    );


                const data =
                    await response.json();


                // ====================================================
                // BACKEND ERROR
                // ====================================================

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to publish blog."
                    );

                    return;

                }


                // ====================================================
                // IF PUBLISHING A DRAFT
                // REMOVE OLD DRAFT
                // ====================================================

                if (editingDraftId) {

                    let drafts =
                        JSON.parse(
                            localStorage.getItem(
                                "blogSphereDrafts"
                            )
                        ) || [];


                    const draftIndex =
                        drafts.findIndex(
                            function (draft) {

                                return draft.id ===
                                    Number(editingDraftId);

                            }
                        );


                    if (draftIndex !== -1) {

                        drafts.splice(
                            draftIndex,
                            1
                        );


                        localStorage.setItem(
                            "blogSphereDrafts",
                            JSON.stringify(drafts)
                        );

                    }


                    localStorage.removeItem(
                        "editingDraftId"
                    );


                    alert(
                        "Draft published successfully! 🚀"
                    );

                }

                else {

                    alert(
                        data.message ||
                        "Blog published successfully! 🚀"
                    );

                }


                // ====================================================
                // GO TO DASHBOARD
                // ====================================================

                window.location.href =
                    "dashboard.html";

            }


            catch (error) {

                console.error(
                    "Create Blog Error:",
                    error
                );


                alert(
                    "Unable to connect to the backend. Please make sure the server is running."
                );

            }

        }
    );

}


// ============================================================
// BLOGSPHERE - SAVE BLOG AS DRAFT
// ============================================================

const draftButton =
    document.querySelector(
        ".draft-button"
    );


if (draftButton) {

    draftButton.addEventListener(
        "click",
        function () {


            // ====================================================
            // GET FORM DATA
            // ====================================================

            const title =
                document.getElementById(
                    "blogTitle"
                ).value.trim();


            const category =
                document.getElementById(
                    "category"
                ).value;


            const tags =
                document.getElementById(
                    "tags"
                ).value.trim();


            const content =
                document.getElementById(
                    "content"
                ).value.trim();


            // ====================================================
            // VALIDATION
            // ====================================================

            if (!title && !content) {

                alert(
                    "Please enter something before saving as draft."
                );

                return;

            }


            // ====================================================
            // GET EXISTING DRAFTS
            // ====================================================

            let drafts =
                JSON.parse(
                    localStorage.getItem(
                        "blogSphereDrafts"
                    )
                ) || [];


            // ====================================================
            // CHECK EDITING DRAFT
            // ====================================================

            const editingDraftId =
                localStorage.getItem(
                    "editingDraftId"
                );


            // ====================================================
            // UPDATE EXISTING DRAFT
            // ====================================================

            if (editingDraftId) {

                const draftIndex =
                    drafts.findIndex(
                        function (draft) {

                            return draft.id ===
                                Number(editingDraftId);

                        }
                    );


                if (draftIndex !== -1) {

                    drafts[draftIndex] = {

                        id:
                            Number(editingDraftId),

                        title:
                            title ||
                            "Untitled Draft",

                        category:
                            category ||
                            "Uncategorized",

                        tags:
                            tags,

                        content:
                            content,

                        status:
                            "draft",

                        createdAt:
                            drafts[draftIndex]
                                .createdAt

                    };


                    localStorage.setItem(
                        "blogSphereDrafts",
                        JSON.stringify(drafts)
                    );


                    localStorage.removeItem(
                        "editingDraftId"
                    );


                    alert(
                        "Draft updated successfully! 📝"
                    );


                    window.location.href =
                        "dashboard.html";


                    return;

                }

            }


            // ====================================================
            // CREATE NEW DRAFT
            // ====================================================

            const newDraft = {

                id:
                    Date.now(),

                title:
                    title ||
                    "Untitled Draft",

                category:
                    category ||
                    "Uncategorized",

                tags:
                    tags,

                content:
                    content,

                status:
                    "draft",

                createdAt:
                    new Date()
                        .toLocaleDateString()

            };


            drafts.push(
                newDraft
            );


            localStorage.setItem(
                "blogSphereDrafts",
                JSON.stringify(drafts)
            );


            alert(
                "Blog saved as draft successfully! 📝"
            );


            window.location.href =
                "dashboard.html";

        }
    );

}


// ============================================================
// BLOGSPHERE - DASHBOARD
// ============================================================

const blogsContainer =
    document.getElementById(
        "blogsContainer"
    );


if (blogsContainer) {


    // ============================================================
    // GET LOCAL BLOGS
    // ============================================================

    const blogs =
        JSON.parse(
            localStorage.getItem(
                "blogSphereBlogs"
            )
        ) || [];


    // ============================================================
    // GET DRAFTS
    // ============================================================

    const drafts =
        JSON.parse(
            localStorage.getItem(
                "blogSphereDrafts"
            )
        ) || [];


    // ============================================================
    // STATISTICS
    // ============================================================

    const statNumbers =
        document.querySelectorAll(
            ".stat-number"
        );


    if (statNumbers.length >= 4) {

        // Total

        statNumbers[0].textContent =
            blogs.length +
            drafts.length;


        // Published

        statNumbers[1].textContent =
            blogs.length;


        // Drafts

        statNumbers[2].textContent =
            drafts.length;


        // Views

        let totalViews = 0;


        blogs.forEach(
            function (blog) {

                totalViews +=
                    Number(blog.views) || 0;

            }
        );


        statNumbers[3].textContent =
            totalViews;

    }


    // ============================================================
    // EMPTY STATE
    // ============================================================

    if (
        blogs.length === 0 &&
        drafts.length === 0
    ) {

        blogsContainer.innerHTML = `

            <div class="no-blogs">

                <div class="empty-icon">
                    ✍️
                </div>

                <h3>
                    You haven't created any blogs yet
                </h3>

                <p>
                    Start writing your first blog
                    and share your thoughts with
                    the BlogSphere community.
                </p>

                <br>

                <a
                    href="create-blog.html"
                    class="create-button"
                >

                    Create Your First Blog

                </a>

            </div>

        `;

    }

    else {

        blogsContainer.innerHTML = "";


        // ========================================================
        // PUBLISHED BLOGS
        // ========================================================

        blogs.forEach(
            function (blog) {

                const blogCard =
                    document.createElement(
                        "article"
                    );


                blogCard.className =
                    "blog-card";


                blogCard.innerHTML = `

                    <span class="blog-category">

                        ${blog.category}

                    </span>

                    <h3>

                        ${blog.title}

                    </h3>

                    <p>

                        ${blog.content.substring(
                            0,
                            150
                        )}

                        ${
                            blog.content.length > 150
                                ? "..."
                                : ""
                        }

                    </p>

                    <div class="blog-meta">

                        Published on
                        ${blog.createdAt}

                    </div>

                `;


                blogsContainer.appendChild(
                    blogCard
                );

            }
        );


        // ========================================================
        // DRAFTS
        // ========================================================

        drafts.forEach(
            function (draft) {

                const draftCard =
                    document.createElement(
                        "article"
                    );


                draftCard.className =
                    "blog-card";


                draftCard.innerHTML = `

                    <span class="blog-category">

                        Draft

                    </span>

                    <h3>

                        ${draft.title}

                    </h3>

                    <p>

                        ${
                            draft.content
                                ? draft.content.substring(
                                    0,
                                    150
                                )
                                : "No content yet..."
                        }

                        ${
                            draft.content &&
                            draft.content.length > 150
                                ? "..."
                                : ""
                        }

                    </p>

                    <div class="blog-meta">

                        Draft saved on
                        ${draft.createdAt}

                    </div>

                    <br>

                    <button
                        class="continue-button"
                        onclick="continueDraft(${draft.id})"
                    >

                        Continue Editing →

                    </button>

                `;


                blogsContainer.appendChild(
                    draftCard
                );

            }
        );

    }

}


// ============================================================
// BLOGSPHERE - CONTINUE EDITING DRAFT
// ============================================================

function continueDraft(draftId) {


    const drafts =
        JSON.parse(
            localStorage.getItem(
                "blogSphereDrafts"
            )
        ) || [];


    const draft =
        drafts.find(
            function (item) {

                return item.id ===
                    draftId;

            }
        );


    if (!draft) {

        alert(
            "Draft not found."
        );

        return;

    }


    localStorage.setItem(
        "editingDraftId",
        draftId
    );


    window.location.href =
        "create-blog.html";

}


// ============================================================
// BLOGSPHERE - LOGOUT
// ============================================================

const logoutLink =
    document.getElementById(
        "logoutLink"
    );


if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            // Remove login status

            localStorage.removeItem(
                "blogSphereLoggedIn"
            );


            // Remove current user

            localStorage.removeItem(
                "blogSphereCurrentUser"
            );


            // Remove editing draft

            localStorage.removeItem(
                "editingDraftId"
            );


            // Go to login

            window.location.href =
                "login.html";

        }
    );

}