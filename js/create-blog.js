const API_URL = "http://localhost:5000/api/blogs";

const blogForm = document.getElementById("blogForm");

blogForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get form values
    const title = document.getElementById("blogTitle").value.trim();
    const category = document.getElementById("category").value;
    const tags = document.getElementById("tags").value.trim();
    const content = document.getElementById("content").value.trim();

    // Basic validation
    if (!title || !category || !content) {
        alert("Please fill in all required fields.");
        return;
    }

    // Blog data
    const blogData = {
        title: title,
        category: category,
        tags: tags,
        content: content
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(blogData)
        });

        const data = await response.json();

        console.log("Create blog response:", data);

        if (!data.success) {
            throw new Error(data.message || "Failed to create blog");
        }

        alert("Blog published successfully! 🎉");

        // Go to dashboard
        window.location.href = "dashboard.html";

    } catch (error) {

        console.error("Error creating blog:", error);

        alert(
            "Unable to publish blog. Please make sure the backend server is running."
        );
    }

});