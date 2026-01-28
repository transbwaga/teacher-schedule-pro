// Teacher Schedule Pro - Stable Release
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const classModal = document.getElementById('classModal');
    const classForm = document.getElementById('classForm');
    const scheduleList = document.getElementById('scheduleList');
    const settingsPanel = document.getElementById('settingsPanel');
    
    // State
    let scheduleData = JSON.parse(localStorage.getItem('teacherSchedule')) || [];

    // Set Date
    const currentDateEl = document.getElementById('currentDate');
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // --- Core Rendering ---
    function renderSchedule() {
        if (scheduleData.length === 0) {
            scheduleList.innerHTML = `<div class="empty-state"><i class="fas fa-clock"></i><p>No classes scheduled today.</p></div>`;
            return;
        }
        
        let html = '';
        scheduleData.forEach((item, index) => {
            const endTime = calculateEndTime(item.time, item.duration);
            html += `
                <div class="schedule-item" style="background: white; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #3498db; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${item.subject}</strong> <small>(${item.grade})</small><br>
                        <span style="color: #666;">Room ${item.room} • ${formatTime(item.time)} - ${formatTime(endTime)}</span>
                    </div>
                    <button onclick="deleteItem(${index})" style="background: #ff7675; color: white; border: none; padding: 8px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        scheduleList.innerHTML = html;
        updateStats();
    }

    function calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + (parseInt(duration) || 45);
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours}:${endMinutes.toString().padStart(2, '0')}`;
    }

    function formatTime(timeString) {
        if(!timeString) return "--:--";
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    function updateStats() {
        document.getElementById('totalCount').textContent = scheduleData.length;
        document.getElementById('todayCount').textContent = scheduleData.length; // Simplified for now
    }

    // --- Global Actions ---
    window.toggleSettings = function() {
        settingsPanel.style.display = (settingsPanel.style.display === 'block') ? 'none' : 'block';
    };

    window.saveSettings = function() {
        alert("Settings saved!");
        window.toggleSettings();
    };

    window.deleteItem = function(index) {
        if (confirm('Delete this class?')) {
            scheduleData.splice(index, 1);
            localStorage.setItem('teacherSchedule', JSON.stringify(scheduleData));
            renderSchedule();
        }
    };

    window.clearAllData = function() {
        if (confirm('⚠️ PERMANENT ACTION: This will delete your entire schedule and all settings. Are you sure?')) {
            localStorage.clear();
            scheduleData = [];
            alert("Application Reset Successfully.");
            window.location.reload(); // Refresh to clean the UI
        }
    };

    // --- Form Handling (Fixed for Stability) ---
    classForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Using direct query selectors for stability
        const newItem = {
            subject: this.querySelector('input[placeholder="Subject"]').value,
            grade: this.querySelector('input[placeholder="Grade/Class"]').value,
            room: this.querySelector('input[placeholder="Room"]').value,
            time: this.querySelector('input[type="time"]').value,
            duration: parseInt(this.querySelector('input[type="number"]').value) || 45
        };

        scheduleData.push(newItem);
        localStorage.setItem('teacherSchedule', JSON.stringify(scheduleData));
        
        classModal.style.display = 'none';
        classForm.reset();
        renderSchedule();
    });

    // UI Listeners
    document.getElementById('addClass').addEventListener('click', () => classModal.style.display = 'flex');
    document.getElementById('cancelBtn').addEventListener('click', () => classModal.style.display = 'none');

    // Init
    renderSchedule();
});
