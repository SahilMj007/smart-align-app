let DB_SERVICES = [];
let servicesLoaded = false;
const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://your-backend-domain.com";

async function getAllJobsFromDB() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/api/jobs`, {
    headers: { Authorization: "Bearer " + token },
  });
  return await res.json();
}

/********************************
 OTP & SIGNUP LOGIC (FIXED)
*********************************/
async function sendOTP(btn) {
  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("Please fill all fields before sending OTP");
    return;
  }

  showLoader();
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Sending...";
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    document.getElementById("otpBox").style.display = "block";
    alert("OTP sent to your email");
  } catch (err) {
    alert("Server error while sending OTP");
  } finally {
    hideLoader();
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Send OTP";
    }
  }
}

async function verifyOTP() {
  showLoader();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const otp = document.getElementById("otpInput").value;

  if (!otp) {
    hideLoader();
    alert("Please enter OTP");
    return;
  }

  try {
    const verifyRes = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      hideLoader();
      alert(verifyData.message);
      return;
    }

    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      hideLoader();
      alert(data.message);
      return;
    }

    alert("Account created successfully! Please login.");
    window.location.href = "index.html";
  } catch (err) {
    alert("Server error");
  } finally {
    hideLoader();
  }
}

/********************************
 ADMIN LOGIN (FIXED)
*********************************/
function adminLogin() {
  if (loginEmail.value === "admin" && loginPassword.value === "Admin@123") {
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("token", "ADMIN_TOKEN"); // 👈 ADD THIS
    location.href = "admin.html";
  } else {
    alert("Invalid Admin Credentials");
  }
}


/********************************
 ADMIN – SERVICE PRICE MANAGEMENT
*********************************/
async function saveServicePrice() {
  const token = localStorage.getItem("token");

  const price = Number(basePrice.value);
  const gst = Number(gstPercent.value);

  const data = {
    key: serviceKey.value,
    name: serviceKey.options[serviceKey.selectedIndex].text,
    price,
    gst,
    gstAmount: (price * gst) / 100,
    total: price + (price * gst) / 100,
  };

  const res = await fetch(`${API_BASE}/api/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    alert("Failed to save service");
    return;
  }

  alert("Service saved");
  loadServicePrices();
}

async function loadServicePricesInDashboard() {
  console.log("loadServicePricesInDashboard called");

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/services`, {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("API error:", errText);
    alert("Failed to load services (API error)");
    return;
  }

  const services = await res.json();
  DB_SERVICES = services;
  servicesLoaded = true;

  // ✅ get elements safely
  const priceFront = document.getElementById("price-front");
  const priceRear = document.getElementById("price-rear");
  const priceShock = document.getElementById("price-shock");

  services.forEach((s) => {
    if (s.key === "frontBalancing" && priceFront) {
      priceFront.innerText = "₹" + s.total;
    }

    if (s.key === "rearBalancing" && priceRear) {
      priceRear.innerText = "₹" + s.total;
    }

    if (s.key === "shockerAlignment" && priceShock) {
      priceShock.innerText = "₹" + s.total;
    }
  });
}

/********************************
 DASHBOARD – PRICE CALCULATION
*********************************/
function calculateAmount() {
  let base = 0,
    gst = 0;

  function add(key) {
    let s = DB_SERVICES.find((x) => x.key === key);
    if (s) {
      base += s.price;
      gst += s.gstAmount;
    }
  }

  if (frontBalancing.checked) add("frontBalancing");
  if (rearBalancing.checked) add("rearBalancing");
  if (shockerAlignment.checked) add("shockerAlignment");

  amountWithoutGST.value = base.toFixed(2);
  gstAmount.value = gst.toFixed(2);
  totalAmount.value = (base + gst).toFixed(2);
}

/********************************
 SAVE JOB CARD (WITH EDIT DATE/TIME)
*********************************/
async function saveJob() {
  if (!servicesLoaded) {
    alert("Please wait, services are still loading...");
    return;
  }

  const editId = localStorage.getItem("editJobId");
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Login expired, please login again");
    window.location.href = "index.html";
    return;
  }

  let now = new Date();
  function getServicePrice(key) {
    let s = DB_SERVICES.find((x) => x.key === key);
    return s ? Number(s.total) : 0;
  }

  const job = {
    vehicle: vehicleNo.value,
    jobCard: jobCardNo.value,
    advisor: advisor.value,
    technician: technician.value,

    frontBalancing: frontBalancing.checked,
    rearBalancing: rearBalancing.checked,
    shockerAlignment: shockerAlignment.checked,

    frontPrice: frontBalancing.checked ? getServicePrice("frontBalancing") : 0,
    rearPrice: rearBalancing.checked ? getServicePrice("rearBalancing") : 0,
    shockerPrice: shockerAlignment.checked
      ? getServicePrice("shockerAlignment")
      : 0,

    amountWithoutGST: Number(amountWithoutGST.value) || 0,
    gstAmount: Number(gstAmount.value) || 0,
    totalAmount: Number(totalAmount.value) || 0,

    remarks: remarks.value,
    entryDate:
      editId && editDate.value
        ? editDate.value
        : now.toISOString().split("T")[0],
    entryTime:
      editId && editTime.value
        ? editTime.value
        : now.toTimeString().slice(0, 5),
  };

  try {
    const url = editId
      ? `${API_BASE}/api/jobs/${editId}`
      : `${API_BASE}/api/jobs`;

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(job),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error saving job");
      return;
    }

    localStorage.removeItem("editJobId"); // 👈 MOVE HERE

    alert(editId ? "Job Updated Successfully" : "Job Saved Successfully");
    window.location.href = "job-list.html";
  } catch (err) {
    alert("Server error");
  }
}

async function loadJobs() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/jobs`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const jobs = await res.json();
    const tbody = document.getElementById("jobTableBody");
    tbody.innerHTML = "";

    jobs.forEach((j, i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
  <td>${j.vehicle}</td>
  <td>${j.jobCard}</td>
  <td>${j.advisor}</td>
  <td>${j.technician}</td>
  <td>${j.frontPrice}</td>
  <td>${j.rearPrice}</td>
  <td>${j.shockerPrice}</td>
  <td>${j.amountWithoutGST || 0}</td>
  <td>${j.gstAmount || 0}</td>
  <td>${j.totalAmount || 0}</td>
  <td>${j.entryDate}</td>
  <td>${j.entryTime}</td>
  <td>
    <button onclick="editJob('${j._id}')" class="btn btn-outline">Edit</button>
    <button onclick="deleteJob('${j._id}')" class="btn btn-danger">Delete</button>
  </td>
`;

      tbody.appendChild(tr);
    });
  } catch (err) {
    alert("Error loading jobs");
  }
}

async function deleteJob(id) {
  if (!confirmAdminPassword()) return;
  if (!confirm("Are you sure you want to delete this job?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const data = await res.json();
  alert(data.message);
  loadJobs();
}

function editJob(id) {
  if (!confirmAdminPassword()) return;
  localStorage.setItem("editJobId", id);
  window.location.href = "dashboard.html";
}

/********************************
 NAVIGATION
*********************************/
function goToJobs() {
  location.href = "job-list.html";
}

function goBack() {
  window.location.href = "dashboard.html";
}

/********************************
 EXPORT HELPERS
*********************************/
function downloadCSV(data, filename) {
  if (!data || data.length === 0) {
    alert("No data available for export");
    return;
  }

  let headers = [
    "Vehicle",
    "Job Card",
    "Advisor",
    "Technician",

    "Front Wheel Balancing Price",
    "Rear Wheel Balancing Price",
    "Shocker Alignment Price",

    "Amount Without GST",
    "GST Amount",
    "Total Amount",

    "Date",
    "Time",
  ];

  let csv = headers.join(",") + "\n";

  data.forEach((j) => {
    csv +=
      [
        j.vehicle,
        j.jobCard,
        j.advisor,
        j.technician,

        j.frontPrice || 0,
        j.rearPrice || 0,
        j.shockerPrice || 0,

        j.amountWithoutGST,
        j.gstAmount,
        j.totalAmount,

        j.entryDate,
        j.entryTime,
      ].join(",") + "\n";
  });

  let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);

  let link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function confirmAdminPassword() {
  let pass = prompt("Enter Admin Password to continue:");

  if (pass === null) return false; // user cancelled

  if (pass !== "Admin@123") {
    alert("Incorrect password. Action denied.");
    return false;
  }

  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("vehicleNo")) return;

  let editData = JSON.parse(localStorage.getItem("editJobData"));
  let editIndex = localStorage.getItem("editIndex");

  if (editData && editIndex !== null) {
    vehicleNo.value = editData.vehicle;
    jobCardNo.value = editData.jobCard;
    advisor.value = editData.advisor;
    technician.value = editData.technician;

    frontBalancing.checked = editData.frontBalancing;
    rearBalancing.checked = editData.rearBalancing;
    shockerAlignment.checked = editData.shockerAlignment;

    remarks.value = editData.remarks;

    amountWithoutGST.value = editData.amountWithoutGST;
    gstAmount.value = editData.gstAmount;
    totalAmount.value = editData.totalAmount;

    // 🔐 Admin-only Date & Time Edit
    document.getElementById("editDateTimeBox").style.display = "block";
    editDate.value = editData.entryDate;
    editTime.value = editData.entryTime;

    document.querySelector("button[onclick='saveJob()']").innerText =
      "Update Job";

    calculateAmount();
  }
});

/********************************
 INCENTIVE – ADMIN SETUP
*********************************/
async function saveIncentives() {
  const token = localStorage.getItem("token");

  const data = {
    front: Number(incFront.value),
    rear: Number(incRear.value),
    shock: Number(incShock.value),
  };

  const res = await fetch(`${API_BASE}/api/incentives`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    alert("Failed to save incentives");
    return;
  }

  alert("Incentives saved");
}

async function loadIncentives() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/incentives`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const i = await res.json();
  incFront.value = i.front || 0;
  incRear.value = i.rear || 0;
  incShock.value = i.shock || 0;
}

/********************************
 INCENTIVE REPORT
*********************************/
async function loadIncentiveReport() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/jobs`, {
    headers: { Authorization: "Bearer " + token },
  });

  let jobs = await res.json();

  const period = document.getElementById("period").value;
  const today = new Date();
  let start, end;

  if (period === "day") {
    start = end = today.toISOString().split("T")[0];
  } else if (period === "week") {
    let first = new Date(today);
    first.setDate(today.getDate() - today.getDay());
    let last = new Date(first);
    last.setDate(first.getDate() + 6);
    start = first.toISOString().split("T")[0];
    end = last.toISOString().split("T")[0];
  } else if (period === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  } else if (period === "year") {
    start = `${today.getFullYear()}-01-01`;
    end = `${today.getFullYear()}-12-31`;
  } else {
    start = document.getElementById("fromInc").value;
    end = document.getElementById("toInc").value;
  }

  jobs = jobs.filter((j) => j.entryDate >= start && j.entryDate <= end);

  const incRes = await fetch(`${API_BASE}/api/incentives`, {
    headers: { Authorization: "Bearer " + token },
  });
  const incentives = await incRes.json();

  const report = {};

  jobs.forEach((j) => {
    if (!report[j.advisor]) {
      report[j.advisor] = { front: 0, rear: 0, shock: 0, total: 0 };
    }

    if (j.frontBalancing) {
      report[j.advisor].front++;
      report[j.advisor].total += incentives.front;
    }

    if (j.rearBalancing) {
      report[j.advisor].rear++;
      report[j.advisor].total += incentives.rear;
    }

    if (j.shockerAlignment) {
      report[j.advisor].shock++;
      report[j.advisor].total += incentives.shock;
    }
  });

  const table = document.getElementById("incentiveTable");
  table.innerHTML = "";

  if (Object.keys(report).length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="table-empty">No data found</td>
      </tr>`;
    return;
  }

  Object.entries(report).forEach(([advisor, r]) => {
    table.innerHTML += `
      <tr>
        <td>${advisor}</td>
        <td>${r.front}</td>
        <td>${r.rear}</td>
        <td>${r.shock}</td>
        <td>₹${r.total}</td>
      </tr>`;
  });
}

function goBackFromIncentive() {
  // go back to dashboard
  window.location.href = "dashboard.html";
}

/********************************
 DARK MODE
*********************************/
function toggleTheme() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light",
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});

function searchJob() {
  let input = document.getElementById("searchInput").value.toLowerCase();
  let rows = document.querySelectorAll("#jobTableBody tr");

  rows.forEach((row) => {
    let vehicle = row.children[0].innerText.toLowerCase();
    let jobcard = row.children[1].innerText.toLowerCase();

    if (vehicle.includes(input) || jobcard.includes(input)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function clearSearchAndBack() {
  document.getElementById("searchInput").value = "";
  window.location.href = "dashboard.html";
}

function exportIncentiveExcel() {
  let rows = document.querySelectorAll("#incentiveTable tr");

  if (rows.length === 0) {
    alert("No data to export");
    return;
  }

  let csv = [];
  csv.push(
    [
      "Advisor",
      "Front Wheel",
      "Rear Wheel",
      "Alignment",
      "Total Incentive",
    ].join(","),
  );

  rows.forEach((row) => {
    let cols = row.querySelectorAll("td");
    let data = [];
    cols.forEach((col) => data.push(col.innerText.replace("₹", "")));
    csv.push(data.join(","));
  });

  let blob = new Blob([csv.join("\n")], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "advisor_incentive_report.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileMenuOverlay");

  menu.classList.toggle("open");

  if (menu.classList.contains("open")) {
    overlay.style.display = "block";
  } else {
    overlay.style.display = "none";
  }
}


function togglePerformanceView() {
  document.getElementById("chartBox").style.display = "block";
}

/********************************
 PERFORMANCE DASHBOARD (WORKING)
*********************************/

let performanceChart = null;
async function loadSelectedPerformance() {
  document.getElementById("chartBox").style.display = "block";

  const type = document.getElementById("performanceType").value;
  if (!type) return alert("Select performance type");

  const period = document.getElementById("period").value;
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/jobs`, {
    headers: { Authorization: "Bearer " + token },
  });

  let jobs = await res.json();

  const today = new Date();
  let start, end;

  if (period === "day") {
    start = end = today.toISOString().split("T")[0];
  } else if (period === "week") {
    let first = new Date(today);
    first.setDate(today.getDate() - today.getDay());
    let last = new Date(first);
    last.setDate(first.getDate() + 6);
    start = first.toISOString().split("T")[0];
    end = last.toISOString().split("T")[0];
  } else if (period === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  } else {
    start = `${today.getFullYear()}-01-01`;
    end = `${today.getFullYear()}-12-31`;
  }

  jobs = jobs.filter((j) => j.entryDate >= start && j.entryDate <= end);

  let labels = [],
    data = [];

  if (type === "technician") {
    const map = {};
    jobs.forEach((j) => (map[j.technician] = (map[j.technician] || 0) + 1));
    labels = Object.keys(map);
    data = Object.values(map);
  } else if (type === "advisor") {
    const map = {};
    jobs.forEach((j) => (map[j.advisor] = (map[j.advisor] || 0) + 1));
    labels = Object.keys(map);
    data = Object.values(map);
  } else if (type === "service") {
    const map = { Front: 0, Rear: 0, Align: 0 };

    jobs.forEach((j) => {
      if (j.frontBalancing) map.Front++;
      if (j.rearBalancing) map.Rear++;
      if (j.shockerAlignment) map.Align++;
    });

    labels = Object.keys(map);
    data = Object.values(map);
  } else if (type === "incentive") {
    const incRes = await fetch(`${API_BASE}/api/incentives`, {
      headers: { Authorization: "Bearer " + token },
    });
    const inc = await incRes.json();

    const map = {};

    jobs.forEach((j) => {
      if (!map[j.advisor]) map[j.advisor] = 0;

      if (j.frontBalancing) map[j.advisor] += inc.front;
      if (j.rearBalancing) map[j.advisor] += inc.rear;
      if (j.shockerAlignment) map[j.advisor] += inc.shock;
    });

    labels = Object.keys(map);
    data = Object.values(map);
  }

  drawBarChart(labels, data);
}

function drawBarChart(labels, data) {
  const type = document.getElementById("performanceType").value;
  const titleMap = {
    technician: "Technician Performance",
    advisor: "Advisor Performance",
    service: "Service Performance",
  };

  const ctx = document.getElementById("performanceChart").getContext("2d");
  if (performanceChart) performanceChart.destroy();

  performanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Count",
          data,
          borderRadius: 8,
          backgroundColor: "rgba(99,102,241,0.8)",
          hoverBackgroundColor: "rgba(99,102,241,1)",
          barThickness: 40,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: titleMap[type] || "Performance",
          font: { size: 18, weight: "bold" },
          padding: { bottom: 20 },
        },
        tooltip: {
          backgroundColor: "#111",
          padding: 12,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 12, weight: "600" },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            stepSize: 1,
            font: { size: 12 },
          },
        },
      },
    },
  });
}

async function exportCustomData() {
  const from = document.getElementById("fromDate")?.value;
  const to = document.getElementById("toDate")?.value;

  let jobs = await getAllJobsFromDB();

  // DATE FILTER (FIXED)
  if (from) {
    jobs = jobs.filter((j) => j.entryDate >= from);
  }
  if (to) {
    jobs = jobs.filter((j) => j.entryDate <= to);
  }

  let selected = [...document.querySelectorAll(".colExport:checked")].map(
    (cb) => cb.value,
  );

  if (selected.length === 0) {
    alert("Please select columns to export");
    return;
  }

  let csv = [];

  // HEADER (uppercase)
  csv.push(selected.map((h) => h.toUpperCase()).join(","));

  jobs.forEach((j, i) => {
    let row = [];

    selected.forEach((col) => {
      if (col === "sno") row.push(i + 1);
      if (col === "advisor") row.push(j.advisor || "");
      if (col === "jobCard") row.push(j.jobCard || "");
      if (col === "vehicle") row.push(j.vehicle || "");
      if (col === "technician") row.push(j.technician || "");
      if (col === "date") row.push(j.entryDate || "");
      if (col === "total") row.push(j.totalAmount || 0);

      // SERVICE PRICE (NOT YES/NO)
      if (col === "front") row.push(j.frontPrice || 0);
      if (col === "rear") row.push(j.rearPrice || 0);
      if (col === "align") row.push(j.shockerPrice || 0);
    });

    csv.push(row.join(","));
  });

  if (csv.length === 1) {
    alert("No data found for selected date");
    return;
  }

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `export_${from || "all"}_to_${to || "all"}.csv`;
  a.click();
}

function toggleExportPanel() {
  const p = document.getElementById("exportPanel");
  p.style.display = p.style.display === "none" ? "block" : "none";
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Server error");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

async function loadEditJob() {
  const id = localStorage.getItem("editJobId");
  if (!id) return;

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/jobs/${id}`, {
    headers: { Authorization: "Bearer " + token },
  });

  if (!res.ok) {
    console.warn("Job not found, clearing editJobId");
    localStorage.removeItem("editJobId");
    return;
  }

  const j = await res.json();

  vehicleNo.value = j.vehicle;
  jobCardNo.value = j.jobCard;
  advisor.value = j.advisor;
  technician.value = j.technician;

  frontBalancing.checked = j.frontBalancing;
  rearBalancing.checked = j.rearBalancing;
  shockerAlignment.checked = j.shockerAlignment;

  document.getElementById("editDateTimeBox").style.display = "block";
  editDate.value = j.entryDate;
  editTime.value = j.entryTime;

  amountWithoutGST.value = j.amountWithoutGST;
  gstAmount.value = j.gstAmount;
  totalAmount.value = j.totalAmount;
  remarks.value = j.remarks;

  document.querySelector("button[onclick='saveJob()']").innerText =
    "Update Job";
}

async function exportPerformanceExcel() {
  const type = document.getElementById("performanceType").value;
  if (!type) return alert("Select performance type first");

  const period = document.getElementById("period").value;
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/jobs`, {
    headers: { Authorization: "Bearer " + token },
  });

  let jobs = await res.json();

  // ---- DATE FILTER ----
  const today = new Date();
  let start, end;

  if (period === "day") {
    start = end = today.toISOString().split("T")[0];
  } else if (period === "week") {
    let first = new Date(today);
    first.setDate(today.getDate() - today.getDay());
    let last = new Date(first);
    last.setDate(first.getDate() + 6);
    start = first.toISOString().split("T")[0];
    end = last.toISOString().split("T")[0];
  } else if (period === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  } else {
    start = `${today.getFullYear()}-01-01`;
    end = `${today.getFullYear()}-12-31`;
  }

  jobs = jobs.filter((j) => j.entryDate >= start && j.entryDate <= end);

  // ---- BUILD REPORT ----
  let rows = [["Name", "Count"]];

  if (type === "technician") {
    const map = {};
    jobs.forEach((j) => (map[j.technician] = (map[j.technician] || 0) + 1));
    Object.entries(map).forEach(([k, v]) => rows.push([k, v]));
  }

  if (type === "advisor") {
    const map = {};
    jobs.forEach((j) => (map[j.advisor] = (map[j.advisor] || 0) + 1));
    Object.entries(map).forEach(([k, v]) => rows.push([k, v]));
  }

  if (type === "service") {
    const map = { Front: 0, Rear: 0, Alignment: 0 };
    jobs.forEach((j) => {
      if (j.frontBalancing) map.Front++;
      if (j.rearBalancing) map.Rear++;
      if (j.shockerAlignment) map.Alignment++;
    });
    Object.entries(map).forEach(([k, v]) => rows.push([k, v]));
  }

  // ---- EXPORT CSV ----
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `performance_${type}_${period}.csv`;
  a.click();
}

function exportChartImage() {
  const canvas = document.getElementById("performanceChart");

  if (!canvas) {
    alert("Chart not found");
    return;
  }

  // convert canvas to image
  const image = canvas.toDataURL("image/png");

  // download
  const link = document.createElement("a");
  link.href = image;
  link.download = "performance_chart.png";
  link.click();
}

async function loadServicePrices() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/services`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (!res.ok) {
    alert("Failed to load services");
    return;
  }

  const services = await res.json();

  const table = document.getElementById("serviceTable");
  table.innerHTML = "";

  services.forEach((s) => {
    table.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>₹${s.price}</td>
        <td>${s.gst}%</td>
        <td>₹${s.gstAmount}</td>
        <td>₹${s.total}</td>
      </tr>
    `;
  });
}

function showLoader() {
  const l = document.getElementById("globalLoader");
  if (l) l.style.display = "flex";
}

function hideLoader() {
  const l = document.getElementById("globalLoader");
  if (l) l.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const desktopWelcome = document.getElementById("welcomeUser");
  const mobileWelcome = document.getElementById("mobileWelcome");

  if (user && user.name) {
    if (desktopWelcome) {
      desktopWelcome.innerText = `Welcome, ${user.name}`;
    }

    if (mobileWelcome) {
      mobileWelcome.innerText = `Welcome, ${user.name}`;
    }
  }
});

async function sendResetLink() {
  const email = document.getElementById("forgotEmail").value;

  if (!email) return alert("Enter email");

  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  alert(data.message);
}

async function resetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const p1 = document.getElementById("newPassword").value;
  const p2 = document.getElementById("confirmPassword").value;

  if (!p1 || !p2) return alert("Fill all fields");
  if (p1 !== p2) return alert("Passwords do not match");

  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password: p1 })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) window.location.href = "index.html";
}
