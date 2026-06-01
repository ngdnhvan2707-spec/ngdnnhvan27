const API =
"https://6a066939c83ba8ad9b3d7102.mockapi.io/api/v1/workouts";
const STORAGE_KEY = "fittrack_admin_workouts";

let form = null;
let showFormBtn = null;
let cancelBtn = null;
let saveBtn = null;
let tableBody = null;
let searchInput = null;
let filterType = null;
let filterIntensity = null;

let workouts = [];
let editId = null;

function initAdminPage() {
    form = document.getElementById("workoutForm");
    showFormBtn = document.getElementById("showFormBtn");
    cancelBtn = document.getElementById("cancelBtn");
    saveBtn = document.getElementById("saveBtn");
    tableBody = document.getElementById("tableBody");
    searchInput = document.getElementById("searchInput");
    filterType = document.getElementById("filterType");
    filterIntensity = document.getElementById("filterIntensity");

    if (!form || !showFormBtn || !cancelBtn || !saveBtn || !tableBody || !searchInput || !filterType || !filterIntensity) {
        console.error("admin.js: thiếu phần tử DOM cần thiết");
        return;
    }

    showFormBtn.addEventListener("click", () => {
        form.classList.toggle("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        form.classList.add("hidden");
        clearForm();
    });

    saveBtn.addEventListener("click", saveWorkout);
    searchInput.addEventListener("input", renderFiltered);
    filterType.addEventListener("change", renderFiltered);
    filterIntensity.addEventListener("change", renderFiltered);

    workouts = loadLocalWorkouts();
    renderFilterOptions();
    renderTable(workouts);

    loadWorkouts();
}

function clearForm(){
    if (form) {
        form.reset();
    }

    document.getElementById("type").value = "Gym";
    document.getElementById("intensity").value = "Nhẹ";

    editId = null;
}

function loadLocalWorkouts() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.warn("Không thể đọc dữ liệu địa phương:", error);
        return [];
    }
}

function saveLocalWorkouts() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch (error) {
        console.warn("Không thể lưu dữ liệu địa phương:", error);
    }
}

async function loadWorkouts(){

    try{
        const res = await fetch(API);
        workouts = await res.json();
        saveLocalWorkouts();
    } catch(error){
        console.error("Không thể tải từ API, dùng dữ liệu cục bộ:", error);
        workouts = loadLocalWorkouts();
    }

    renderFilterOptions();
    renderTable(workouts);
}

function renderFilterOptions(){

const types =
[...new Set(
workouts.map(
item => item.type
)
)];

filterType.innerHTML =
'<option value="">Tất cả loại</option>';

types.forEach(type => {

filterType.innerHTML += `

<option value="${type}">
${type}
</option>
`;

});

}

function intensityBadge(level){

if(level === "Nhẹ"){
    return `<span class="badge low">Nhẹ</span>`;
}

if(level === "Trung Bình"){
    return `<span class="badge medium">Trung Bình</span>`;
}

return `<span class="badge high">Nặng</span>`;

}

function renderTable(data){
    tableBody.innerHTML = "";

    if(!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;color:#999;padding:20px;">
                    Chưa có buổi tập nào.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(item => {
        tableBody.innerHTML += `
            <tr>
                <td>${item.name || ""}</td>
                <td>${item.date || ""}</td>
                <td>${item.type || ""}</td>
                <td>${intensityBadge(item.intensity)}</td>
                <td>${item.duration || 0} phút</td>
                <td>${item.calories || 0}</td>
                <td>
                    <div class="action-group">
                        <button class="action-btn edit-btn" onclick="editWorkout('${item.id}')" title="Sửa buổi tập">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteWorkout('${item.id}')" title="Xóa buổi tập">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function renderFiltered(){

const keyword =
searchInput.value.toLowerCase();

const type =
filterType.value;

const intensity =
filterIntensity.value;

const filtered =
workouts.filter(item => {

const matchName =
(item.name || "")
.toLowerCase()
.includes(keyword);

const matchType =
!type ||
item.type === type;

const matchIntensity =
!intensity ||
item.intensity === intensity;

return (
matchName &&
matchType &&
matchIntensity
);

});

renderTable(filtered);

}

async function saveWorkout(){

    const workout = {
        name: document.getElementById("name").value,
        date: document.getElementById("date").value,
        type: document.getElementById("type").value,
        intensity: document.getElementById("intensity").value,
        duration: document.getElementById("duration").value,
        calories: document.getElementById("calories").value,
        sets: document.getElementById("sets").value,
        reps: document.getElementById("reps").value,
        note: document.getElementById("note").value
    };

    if(!workout.name){
        alert("Vui lòng nhập tên buổi tập");
        return;
    }

    try{
        if(editId){
            await fetch(`${API}/${editId}`, {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(workout)
            });
            workouts = workouts.map(item => item.id === editId ? { ...item, ...workout } : item);
        } else {
            const response = await fetch(API, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(workout)
            });
            const created = await response.json();
            const newItem = created && created.id ? created : { ...workout, id: Date.now().toString() };
            workouts.push(newItem);
        }
        saveLocalWorkouts();
        form.classList.add("hidden");
        clearForm();
        renderFilterOptions();
        renderTable(workouts);
    } catch(error){
        console.error("Lưu từ xa thất bại, dùng bộ nhớ cục bộ:", error);
        if(editId){
            workouts = workouts.map(item => item.id === editId ? { ...item, ...workout } : item);
        } else {
            workouts.push({ ...workout, id: Date.now().toString() });
        }
        saveLocalWorkouts();
        form.classList.add("hidden");
        clearForm();
        renderFilterOptions();
        renderTable(workouts);
    }
}

async function editWorkout(id){

const item =
workouts.find(
w => w.id === id
);

if(!item) return;

editId = id;

document.getElementById("name").value =
item.name || "";

document.getElementById("date").value =
item.date || "";

document.getElementById("type").value =
item.type || "Gym";

document.getElementById("intensity").value =
item.intensity || "Nhẹ";

document.getElementById("duration").value =
item.duration || "";

document.getElementById("calories").value =
item.calories || "";

document.getElementById("sets").value =
item.sets || "";

document.getElementById("reps").value =
item.reps || "";

document.getElementById("note").value =
item.note || "";

form.classList.remove("hidden");

window.scrollTo({
top:0,
behavior:"smooth"
});

}

async function deleteWorkout(id){

    const ok = confirm("Bạn có chắc muốn xóa?");
    if(!ok) return;

    try {
        await fetch(`${API}/${id}`, { method:"DELETE" });
        workouts = workouts.filter(item => item.id !== id);
        saveLocalWorkouts();
        renderFilterOptions();
        renderTable(workouts);
    } catch(error) {
        console.error("Xóa từ xa thất bại, xóa cục bộ:", error);
        workouts = workouts.filter(item => item.id !== id);
        saveLocalWorkouts();
        renderFilterOptions();
        renderTable(workouts);
    }
}

window.initAdminPage = initAdminPage;
window.saveWorkout = saveWorkout;
window.editWorkout = editWorkout;
window.deleteWorkout = deleteWorkout;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminPage);
} else {
    initAdminPage();
}





const currentPage =
window.location.pathname.split("/").pop();

document.querySelectorAll("nav a")
.forEach(link => {

    link.classList.remove("active");

    const href =
    link.getAttribute("href");

    if(href === currentPage){
        link.classList.add("active");
    }

});




















