const API = "https://6a066939c83ba8ad9b3d7102.mockapi.io/api/v1/workouts";

const historyTable = document.getElementById("historyTable");
const totalCaloriesEl = document.getElementById("totalCalories");
const totalWorkoutsEl = document.getElementById("totalWorkouts");
const totalMinutesEl = document.getElementById("totalMinutes");
const avgMinutesEl = document.getElementById("avgMinutes");
const chartCaloriesTextEl = document.getElementById("chartCalories");
const chartTimeTextEl = document.getElementById("chartTime");
const caloriesCanvas = document.getElementById("caloriesChart");
const timeCanvas = document.getElementById("timeChart");

function parseDateString(date) {
    if (!date) return new Date(0);
    const parts = date.split("/");
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`);
    }
    return new Date(date);
}

async function loadHistory() {
    try {
        const response = await fetch(API);
        const workouts = await response.json();
        renderHistory(workouts);
    } catch (error) {
        console.error("Không thể tải dữ liệu lịch sử:", error);
        historyTable.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:#999">Không thể tải dữ liệu</td>
            </tr>
        `;
    }
}

function renderHistory(workouts) {
    let totalCalories = 0;
    let totalMinutes = 0;

    historyTable.innerHTML = "";

    if (workouts.length === 0) {
        historyTable.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:#999">Chưa có buổi tập nào</td>
            </tr>
        `;
    }

    workouts
        .sort((a, b) => parseDateString(b.date) - parseDateString(a.date))
        .forEach(item => {
            const duration = Number(item.duration) || 0;
            const calories = Number(item.calories) || 0;

            totalCalories += calories;
            totalMinutes += duration;

            historyTable.innerHTML += `
                <tr>
                    <td>${item.date || ""}</td>
                    <td>${item.name || item.type || ""}</td>
                    <td>${duration} phút</td>
                    <td>${calories}</td>
                </tr>
            `;
        });

    totalCaloriesEl.textContent = totalCalories;
    totalWorkoutsEl.textContent = workouts.length;
    totalMinutesEl.textContent = `${totalMinutes} phút`;
    avgMinutesEl.textContent = workouts.length > 0 ? `${Math.round(totalMinutes / workouts.length)} phút` : "0 phút";
    chartCaloriesTextEl.textContent = `🔥 Tổng calo đốt: ${totalCalories}`;
    chartTimeTextEl.textContent = `⏱️ Tổng thời gian: ${totalMinutes} phút`;
    drawCaloriesChart(workouts);
    drawTimeChart(workouts);
}

function drawCaloriesChart(workouts) {
    if (!caloriesCanvas) return;
    const ctx = caloriesCanvas.getContext("2d");
    const padding = 50;
    const width = caloriesCanvas.width;
    const height = caloriesCanvas.height;
    const sorted = [...workouts].sort((a, b) => parseDateString(a.date) - parseDateString(b.date));
    const values = sorted.map(item => Number(item.calories) || 0);
    const labels = sorted.map(item => item.date ? item.date.slice(0, 5) : "-");
    const maxValue = Math.max(...values, 10);
    const steps = 5;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff";

    for (let i = 0; i <= steps; i++) {
        const y = padding + ((height - padding * 2) / steps) * i;
        const value = Math.round(maxValue - (maxValue / steps) * i);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillText(value, padding - 10, y + 4);
        ctx.textAlign = "left";
        ctx.fillText(value, width - padding + 10, y + 4);
    }

    const barWidth = Math.max(24, (width - padding * 2) / Math.max(values.length, 1) - 10);
    values.forEach((value, index) => {
        const x = padding + index * (barWidth + 10) + 10;
        const barHeight = ((height - padding * 2) * value) / maxValue;
        const y = height - padding - barHeight;
        ctx.fillStyle = "#ffd000";
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(labels[index], x + barWidth / 2, height - padding + 18);
    });
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText("Calo", padding, padding - 20);
}

function drawTimeChart(workouts) {
    if (!timeCanvas) return;
    const ctx = timeCanvas.getContext("2d");
    const padding = 50;
    const width = timeCanvas.width;
    const height = timeCanvas.height;
    const sorted = [...workouts].sort((a, b) => parseDateString(a.date) - parseDateString(b.date));
    const values = sorted.map(item => Number(item.duration) || 0);
    const labels = sorted.map(item => item.date ? item.date.slice(0, 5) : "-");
    const maxValue = Math.max(...values, 10);
    const steps = 5;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff";

    for (let i = 0; i <= steps; i++) {
        const y = padding + ((height - padding * 2) / steps) * i;
        const value = Math.round(maxValue - (maxValue / steps) * i);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillText(value, padding - 10, y + 4);
        ctx.textAlign = "left";
        ctx.fillText(value, width - padding + 10, y + 4);
    }

    const points = values.map((value, index) => {
        const x = padding + ((width - padding * 2) / Math.max(values.length - 1, 1)) * index;
        const y = height - padding - ((height - padding * 2) * value) / maxValue;
        return { x, y, label: labels[index] };
    });

    if (points.length === 0) {
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("Chưa có dữ liệu", width / 2, height / 2);
        return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = "#ffd000";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.lineTo(points[0].x, height - padding);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 208, 0, 0.25)";
    ctx.fill();
    ctx.strokeStyle = "#ffd000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd000";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(point.label, point.x, height - padding + 18);
    });
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText("Thời gian", padding, padding - 20);
}

loadHistory();
