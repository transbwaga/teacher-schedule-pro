document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const classModal = document.getElementById('classModal');
    const classForm = document.getElementById('classForm');
    const scheduleList = document.getElementById('scheduleList');
    const currentDateEl = document.getElementById('currentDate');
    const settingsPanel = document.getElementById('settingsPanel');
    
    // State
    let scheduleData = JSON.parse(localStorage.getItem('teacherSchedule')) || [];

    // Set Date Display
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // --- Core Functions ---

    function calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours}:${endMinutes.toString().padStart(2, '0')}`;
    }

    function formatTime(timeString) {
        if(!timeString) return "";
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    // --- Rendering Logic ---

    function renderTodayView() {
        const today = new Date().getDay();
        const todayClasses = scheduleData.filter(item => 
            item.days && item.days.includes(today)
        ).sort((a, b) => a.time.localeCompare(b.time));

        if (todayClasses.length === 0) {
            scheduleList.innerHTML = `<div class="empty-state"><i class="fas fa-coffee"></i><p>No classes for today. Relax!</p></div>`;
            updateStats();
            return;
        }

        let html = '<h2>Today\'s Schedule</h2>';
        todayClasses.forEach((item) => {
            const index = scheduleData.indexOf(item);
            html += createScheduleCard(item, index);
        });
        scheduleList.innerHTML = html;
        updateStats();
    }

    function renderWeekView() {
        const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        let html = '<h2>Weekly Timetable</h2>';
        
        for (let i = 1; i <= 5; i++) {
            const dayClasses = scheduleData.filter(item => 
                item.days && item.days.includes(i)
            ).sort((a, b) => a.time.localeCompare(b.time));
            
            html += `<div style="margin-bottom: 20px; padding: 10px; background: #f8f9fa; border-radius: 10px; border-left: 5px solid #3498db;">
                        <h4 style="color: #2c3e50;">${days[i]}</h4>`;
            
            if (dayClasses.length === 0) {
                html += `<p style="font-size: 0.8rem; color: #999;">No classes</p>`;
            } else {
                dayClasses.forEach(item => {
                    const index = scheduleData.indexOf(item);
                    html += createScheduleCard(item, index);
                });
            }
            html += `</div>`;
        }
        scheduleList.innerHTML = html;
    }

    function createScheduleCard(item, index) {
        const endTime = calculateEndTime(item.time, item.duration);
        return `
            <div class="schedule-item" style="background: white; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #2ecc71; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div>
                    <strong>${item.subject}</strong> <small>(${item.grade || 'N/A'})</small><br>
                    <span style="color: #666; font-size: 0.9rem;">
                        <i class="far fa-clock"></i> ${formatTime(item.time)} - ${formatTime(endTime)} • Room ${item.room || 'TBD'}
                    </span>
                </div>
                <button onclick="deleteItem(${index})" style="background: #ff7675; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    function updateStats() {
        const today = new Date().getDay();
        const todayCount = scheduleData.filter(i => i.days && i.days.includes(today)).length;
        
        document.getElementById('todayCount').textContent = todayCount;
        document.getElementById('weekCount').textContent = scheduleData.length;
        document.getElementById('totalCount').textContent = scheduleData.length;

        // Find Next Class
        const nowTime = new Date().getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0');
        const upcoming = scheduleData
            .filter(i => i.days && i.days.includes(today) && i.time > nowTime)
            .sort((a, b) => a.time.localeCompare(b.time));
        
        document.getElementById('nextClass').textContent = upcoming.length > 0 ? formatTime(upcoming[0].time) : "--:--";
    }

    // --- Global Actions (Attached to window so HTML can see them) ---

    window.toggleSettings = function() {
        settingsPanel.style.display = (settingsPanel.style.display === 'block') ? 'none' : 'block';
    };

    window.saveSettings = function() {
        const settings = {
            notifications: document.getElementById('notificationsToggle').checked
        };
        localStorage.setItem('teacherSettings', JSON.stringify(settings));
        alert("Settings Saved!");
        window.toggleSettings();
    };

    window.deleteItem = function(index) {
        if (confirm('Delete this class?')) {
            scheduleData.splice(index, 1);
            localStorage.setItem('teacherSchedule', JSON.stringify(scheduleData));
            
            // Refresh whatever view is currently active
            const activeView = document.querySelector('.view-option.active').dataset.view;
            if(activeView === 'week') renderWeekView(); else renderTodayView();
        }
    };

    window.printSchedule = () => window.print();

    // --- Form Handling ---

    classForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedDays = Array.from(this.querySelectorAll('input[name="days"]:checked'))
                                  .map(cb => parseInt(cb.value));
        
        if(selectedDays.length === 0) {
            alert("Please select at least one day!");
            return;
        }

        const newItem = {
            subject: document.getElementById('subjectInput').value,
            grade: document.getElementById('gradeInput').value,
            room: document.getElementById('roomInput').value,
            time: document.getElementById('timeInput').value,
            duration: parseInt(document.getElementById('durationInput').value) || 45,
            days: selectedDays
        };

        scheduleData.push(newItem);
        localStorage.setItem('teacherSchedule', JSON.stringify(scheduleData));
        
        classModal.style.display = 'none';
        classForm.reset();
        
        // Refresh view
        const activeView = document.querySelector('.view-option.active').dataset.view;
        if(activeView === 'week') renderWeekView(); else renderTodayView();
    });

    // --- UI Listeners ---

    document.getElementById('addClass').addEventListener('click', () => {
        classModal.style.display = 'flex';
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        classModal.style.display = 'none';
    });
    
    document.querySelectorAll('.view-option').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.view-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            if (this.dataset.view === 'week') renderWeekView();
            else renderTodayView();
        });
    });

    // Close modal on outside click
    window.onclick = function(event) {
        if (event.target == classModal) classModal.style.display = "none";
    };

    // Initialize
    renderTodayView();
});
