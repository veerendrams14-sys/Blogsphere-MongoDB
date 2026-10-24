const API_URL = "http://localhost:5000/api/blogs";

const blogForm = document.getElementById("blogForm");
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

const titleHeading = document.querySelector(".create-header h1");
const submitButton = blogForm.querySelector('button[type="submit"]');
const draftButton = blogForm.querySelector(".draft-button");

let isLoadingBlog = false;

function formValues(status) {
  return {
    title: document.getElementById("blogTitle").value.trim(),
    category: document.getElementById("category").value,
    tags: document.getElementById("tags").value.trim(),
    content: document.getElementById("content").value.trim(),
    status
  };
}

async function saveBlog(status) {
  if (isLoadingBlog) return;

  const blogData = formValues(status);

  if (!blogData.title || !blogData.category || !blogData.content) {
    alert("Please fill in the title, category and content.");
    return;
  }

  const originalSubmitText = submitButton.textContent;

  submitButton.disabled = true;
  draftButton.disabled = true;
  submitButton.textContent = editId ? "Saving..." : "Publishing...";

  try {
    const response = await fetch(
      editId
        ? `${API_URL}/${encodeURIComponent(editId)}`
        : API_URL,
      {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(blogData)
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to save blog.");
    }

    alert(
      status === "draft"
        ? "Draft saved successfully!"
        : editId
          ? "Blog updated successfully!"
          : "Blog published successfully!"
    );

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Save blog error:", error);

    alert(
      `${error.message || "Unable to save blog."} ` +
      "Please check that the backend is running and MongoDB is connected."
    );
  } finally {
    submitButton.disabled = false;
    draftButton.disabled = false;
    submitButton.textContent = originalSubmitText;
  }
}

blogForm.addEventListener("submit", function (event) {
  event.preventDefault();
  saveBlog("published");
});

draftButton.addEventListener("click", function (event) {
  event.preventDefault();
  saveBlog("draft");
});

async function loadBlogForEditing() {
  if (!editId) return;

  isLoadingBlog = true;

  submitButton.disabled = true;
  draftButton.disabled = true;

  if (titleHeading) {
    titleHeading.textContent = "Edit Blog";
  }

  submitButton.textContent = "Loading Blog...";

  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(editId)}`
    );

    const data = await response.json();

    if (!response.ok || !data.success || !data.blog) {
      throw new Error(data.message || "Unable to load blog details.");
    }

    const blog = data.blog;

    document.getElementById("blogTitle").value = blog.title || "";

    const categoryField = document.getElementById("category");
    categoryField.value = blog.category || "";

    // If the category is not in the dropdown, add it.
    if (blog.category && categoryField.value !== blog.category) {
      const option = document.createElement("option");
      option.value = blog.category;
      option.textContent = blog.category;
      categoryField.appendChild(option);
      categoryField.value = blog.category;
    }

    document.getElementById("tags").value = blog.tags || "";
    document.getElementById("content").value = blog.content || "";

    submitButton.textContent =
      blog.status === "published"
        ? "Save Changes & Publish"
        : "Publish Blog";

    draftButton.textContent = "Save Changes as Draft";

  } catch (error) {
    console.error("Load blog error:", error);

    alert(
      `${error.message || "Unable to load blog details."} ` +
      "Please try again."
    );

    window.location.href = "dashboard.html";

  } finally {
    isLoadingBlog = false;
    submitButton.disabled = false;
    draftButton.disabled = false;
  }
}

loadBlogForEditing();