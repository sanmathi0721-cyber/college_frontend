// 🔗 Your backend URL
const API = "https://college-backend-1-yet5.onrender.com";

// ---------------- Fetch Notices ----------------
async function loadNotices() {
  const list = document.getElementById("noticeList");
  if (!list) return;

  try {
    const res = await fetch(`${API}/notices`);
    if (!res.ok) throw new Error("Server not reachable");
    const notices = await res.json();

    list.innerHTML = notices.length
      ? notices.map(n => `
          <div class="notice-card">
            <h3>${n.title}</h3>
            <p>${n.content}</p>
            <span><b>Category:</b> ${n.category}</span>
          </div>
        `).join("")
      : "<p>No notices yet.</p>";
  } catch (err) {
    list.innerHTML = `<p style="color:red;">Cannot reach server. Please check backend link.</p>`;
    console.error(err);
  }
}

// ---------------- Add Notice ----------------
const form = document.getElementById("noticeForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const category = document.getElementById("category").value || "General";
    const msg = document.getElementById("adminMessage");

    try {
      const res = await fetch(`${API}/add_notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      const data = await res.json();
      msg.style.color = res.ok ? "green" : "red";
      msg.textContent = data.message || data.error;

      if (res.ok) form.reset();
    } catch (err) {
      msg.style.color = "red";
      msg.textContent = "Cannot reach server. Please check backend link.";
      console.error(err);
    }
  });
}

// Load notices automatically when page opens
loadNotices();
