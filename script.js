// Name: [ใส่ชื่อของคุณ]
// Student ID: [ใส่รหัสนิสิต]

let students = []; // ตัวแปรหลักเก็บข้อมูลทั้งหมด

// --- Part A: Load JSON Data ---
async function loadStudents() {
  try {
    const res = await fetch("students.json");
    if (!res.ok) throw new Error("Failed to connect");
    
    students = await res.json();
    console.log("Data Loaded:", students);

    // เริ่มต้นทำงาน Render หน้าเว็บ
    renderKPI(students);
    renderTable(students);
    renderMajorFilter(students);
    
    // Bonus: โหลดค่า Filter เดิมจาก LocalStorage (ถ้ามี)
    loadSavedFilter();

  } catch (err) {
    console.error("Failed to load students:", err);
    alert("Error loading data!");
  }
}

// เรียกใช้งานฟังก์ชันโหลดข้อมูลทันที
loadStudents();

// --- Part B: Dashboard Summary ---
function renderKPI(data) {
  // 1. Total Students
  const count = data.length;
  document.getElementById("total-students").innerText = count;

  // 2. Average GPA (ใช้ reduce)
  const totalGPA = data.reduce((sum, s) => sum + s.gpa, 0);
  const avg = count > 0 ? (totalGPA / count).toFixed(2) : "0.00";
  document.getElementById("avg-gpa").innerText = avg;

  // 3. Probation Count (ใช้ filter)
  const probationCount = data.filter(s => s.gpa < 2.00).length;
  document.getElementById("probation-count").innerText = probationCount;

  // 4. Top Student (ใช้ reduce)
  if (count > 0) {
    const top = data.reduce((prev, curr) => (prev.gpa > curr.gpa) ? prev : curr);
    document.getElementById("top-student").innerText = `${top.name} (${top.gpa})`;
  } else {
    document.getElementById("top-student").innerText = "-";
  }
}

// --- Part C: Student List Table ---
function renderTable(data) {
  const tbody = document.getElementById("student-table-body");
  
  // สร้าง HTML ด้วย map
  const html = data.map(student => {
    // เช็คเงื่อนไข Probation
    const isProbation = student.gpa < 2.00 ? "probation" : "";
    
    return `
      <tr class="${isProbation}">
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.major}</td>
        <td>${student.gpa.toFixed(2)}</td>
        <td>
          <button onclick="showStudentDetail('${student.id}')">View</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = html;
}

// --- Part D: Search & Filter ---
function renderMajorFilter(data) {
    // สร้าง Dropdown Major จากข้อมูลที่มีจริง
    const majors = [...new Set(data.map(s => s.major))];
    const select = document.getElementById("major-filter");
    
    // Reset options
    select.innerHTML = '<option value="all">All Majors</option>';
    
    majors.forEach(m => {
        select.innerHTML += `<option value="${m}">${m}</option>`;
    });
}

function handleSearchAndFilter() {
    const searchText = document.getElementById("search-input").value.toLowerCase();
    const selectedMajor = document.getElementById("major-filter").value;

    // Bonus: Save to LocalStorage
    localStorage.setItem("savedMajor", selectedMajor);

    // Logic การกรองข้อมูล
    const filtered = students.filter(s => {
        const matchNameOrID = s.name.toLowerCase().includes(searchText) || s.id.includes(searchText);
        const matchMajor = selectedMajor === "all" || s.major === selectedMajor;
        return matchNameOrID && matchMajor;
    });

    renderTable(filtered);
    // ถ้าต้องการให้ Dashboard เปลี่ยนตามการค้นหา ให้ Uncomment บรรทัดล่าง
    // renderKPI(filtered); 
}

// Event Listeners
document.getElementById("search-input").addEventListener("input", handleSearchAndFilter);
document.getElementById("major-filter").addEventListener("change", handleSearchAndFilter);

// --- Part E: Student Detail ---
// ต้องประกาศเป็น window function
window.showStudentDetail = function(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        const detailBox = document.getElementById("student-detail");
        const content = document.getElementById("detail-content");
        
        content.innerHTML = `
            <p><strong>ID:</strong> ${student.id}</p>
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>Major:</strong> ${student.major}</p>
            <p><strong>GPA:</strong> ${student.gpa}</p>
            <p><strong>Status:</strong> ${student.gpa < 2.00 ? '<span style="color:red">Probation</span>' : 'Normal'}</p>
        `;
        detailBox.style.display = "block";
    }
};

// Bonus: Helper function
function loadSavedFilter() {
    const saved = localStorage.getItem("savedMajor");
    if (saved) {
        document.getElementById("major-filter").value = saved;
        handleSearchAndFilter(); // Filter ทันทีที่โหลด
    }
}