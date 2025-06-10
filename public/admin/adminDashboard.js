document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Call the logout API
    await fetch('http://localhost:5000/api/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Clear the token from localStorage
    localStorage.removeItem('token');
    
    // Redirect to home page and prevent caching
    window.location.replace('http://localhost:5000');
    
  } catch (error) {
    console.error('Logout failed:', error);
  }
});
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/admin/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to fetch profile");

    const admin = await response.json();
    const tableRows = document.querySelectorAll(".admin-table tr");
    tableRows[0].querySelector("td").textContent = admin.name;
    tableRows[1].querySelector("td").textContent = admin.email;
    tableRows[2].querySelector("td").textContent = admin.phone;
    loadPendingApprovals();
  } catch (err) {
    console.error(err.message);
    alert("Session expired or error fetching data");
    window.location.href = "adminLogin.html";
  }
  
});
async function loadPendingApprovals() {
  try {
    const response = await fetch("http://localhost:5000/api/alumni/pendingAlumni", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    
    if (!response.ok) throw new Error("Failed to load approvals");
    
    const pendingAlumni = await response.json();
    const container = document.getElementById("pending-approvals");
    container.innerHTML = '';
    
    pendingAlumni.forEach(alumni => {
      const card = document.createElement("div");
      card.className = "approval-card";
      card.innerHTML = `
        <p><strong>Name:</strong> ${alumni.name}</p>
        <p><strong>Email:</strong> ${alumni.email}</p>
        <p><strong>Status:</strong> ${alumni.isRejected ? 'Rejected' : 'Pending'}</p>
        <img src="${alumni.collegeIdPath}" alt="College ID" style="width: 700px; height: auto;">
        <div class="approval-buttons">
          <button data-id="${alumni._id}" class="approve-btn">Approve</button>
          <button data-id="${alumni._id}" class="reject-btn">Reject</button>
        </div>
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", handleApproval);
    });
    
    document.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", handleRejection);
    });
  } catch (err) {
    console.error("Approvals error:", err);
  }
}

async function handleApproval(e) {
  const id = e.target.dataset.id;
  await updateApprovalStatus(id, 'approve');
}

async function handleRejection(e) {
  const id = e.target.dataset.id;
  await updateApprovalStatus(id, 'reject');
}

async function updateApprovalStatus(id, action) {
  try {
    const response = await fetch(`http://localhost:5000/api/alumni/${action}Alumni/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) throw new Error(`${action} failed`);
    alert(`Alumni ${action}d successfully`);
    loadPendingApprovals();
  } catch (err) {
    console.error(err);
    alert(`Error: ${err.message}`);
  }
}
// Add this to adminDashboard.js
document.getElementById('create-btn').addEventListener('click', function() {
  const options = document.getElementById('create-options');
  options.style.display = options.style.display === 'none' ? 'block' : 'none';
});

// Close the dropdown if clicked outside
window.addEventListener('click', function(event) {
  if (!event.target.matches('.create-btn')) {
    const options = document.getElementById('create-options');
    if (options.style.display === 'block') {
      options.style.display = 'none';
    }
  }
});

