const API = "https://college-backend-1-yet5.onrender.com"; // <-- Replace with your actual backend URL

// Load notices (for both admin and student)
async function loadNotices() {
  try {
    const res = await fetch(`${API}/notices`);
    const data = await res.json();

    const container = document.getElementById("notices-container") || document.getElementById("admin-notice-list");
    if (!container) return;

    container.innerHTML = data.length
      ? data.map(n => `
        <div class="notice-item">
          <h3>${n.title}</h3>
          <p>${n.content}</p>
          <small>Category: ${n.category}</small>
        </div>`).join("")
      : "<p>No notices yet.</p>";
  } catch (err) {
    console.error(err);
    alert("Cannot reach server. Please check backend link.");
  }
}

// Post new notice (Admin)
const form = document.getElementById("noticeForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const category = document.getElementById("category").value;

    try {
      const res = await fetch(`${API}/add_notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });
      if (res.ok) {
        alert("Notice added!");
        form.reset();
        loadNotices();
      } else {
        alert("Error adding notice");
      }
    } catch (err) {
      alert("Cannot connect to server");
    }
  });
}

// Auto-load notices
document.addEventListener("DOMContentLoaded", loadNotices);
