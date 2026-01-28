// Teacher Schedule Pro - CORRECTED VERSION
console.log("App starting...");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded! Setting up...");
    
    // Get elements
    const addClassBtn = document.getElementById('addClass');
    const addMeetingBtn = document.getElementById('addMeeting');
    const classModal = document.getElementById('classModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const classForm = document.getElementById('classForm');
    const scheduleList = document.getElementById('scheduleList');
    const currentDateEl = document.getElementById('currentDate');
    
    console.log("Elements found:", {
        addClassBtn: !!addClassBtn,
        classModal: !!classModal,
        cancelBtn: !!cancelBtn,
        classForm: !!classForm,
        scheduleList: !!scheduleList
    });
    
    // Set current date
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Load saved schedule
    let scheduleData = JSON.parse(localStorage.getItem('teacherSchedule')) || [];
    console.log("Loaded schedule:", scheduleData);
    
    // Display schedule
    function renderSchedule() {
        if (scheduleData.length === 0) {
            scheduleList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No classes scheduled today.</p>
                    <button class="btn primary" style="margin-top: 15px;" onclick="addSampleData()">
                        Add Sample Schedule
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '';
        scheduleData.forEach((item, index) => {
            const endTime = calculateEndTime(item.time, item.duration);
            html += `
                <div class="schedule-item" style="
                    background: white; 
                    padding: 15px; 
                    margin: 10px 0; 
                    border-radius: 10px; 
                    border-left: 4px solid #3498db;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <strong style="color: #2c3e50;">${item.subject}</strong>
                        <div style="color: #666; margin-top: 5px;">
                            ${item.grade} • Room ${item.room} • ${formatTime(item.time)}-${endTime}
                        </div>
                    </div>
                    <button onclick="takeAttendance(${index})" style="
    background: #3498db; color: white; border: none; padding: 5px 10px; 
    border-radius: 5px; margin-right: 5px; cursor: pointer;
">
    <i class="fas fa-clipboard-check"></i> Attendance
</button>
                </div>
            `;
        });
        scheduleList.innerHTML = html;
    }
    
    // Helper functions
    function calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours}:${endMinutes.toString().padStart(2, '0')}`;
    }
    
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // Modal functions
    function showModal() {
        console.log("Opening modal...");
        classModal.style.display = 'flex';
    }
    
    function hideModal() {
        classModal.style.display = 'none';
        classForm.reset();
    }
    
    // Event listeners
    addClassBtn.addEventListener('click', showModal);
    console.log("Add Class button listener added");
    
    addMeetingBtn.addEventListener('click', function() {
        const inputs = classForm.querySelectorAll('input');
        inputs[0].value = "Staff Meeting";
        inputs[1].value = "All Teachers";
        inputs[2].value = "Conference Room";
        inputs[4].value = "60";
        showModal();
    });
    
    cancelBtn.addEventListener('click', hideModal);
    
    classForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Form submitted!");
        
        const inputs = this.querySelectorAll('input');
        const newItem = {
            subject: inputs[0].value,
            grade: inputs[1].value,
            room: inputs[2].value,
            time: inputs[3].value,
            duration: parseInt(inputs[4].value) || 45
        };
        
        scheduleData.push(newItem);
        localStorage.setItem('teacherSchedule', JSON.stringify(scheduleData));
        
        renderSchedule();
        hideModal();
        
        alert(`Added: ${newItem.subject} at ${formatTime(newItem.time)}`);
    });
    
    // Close modal when clicking outside
    classModal.addEventListener('click', function(e) {
        if (e.target === classModal) hideModal();
    });
    
    // Global functions
    window.deleteItem = function(index) {
        if (confirm('Delete this item?')) {
            scheduleData.splice(index, 1);
            localStorage.setItem('teacherSchedule', JSON.stringify(scheduleData));
            renderSchedule();
        }
    };
    
    window.addSampleData = function() {
        scheduleData = [
            { subject: "Mathematics", grade: "Grade 10", room: "205", time: "09:00", duration: 45 },
            { subject: "Science Lab", grade: "Grade 9", room: "Lab 3", time: "11:00", duration: 90 },
            { subject: "English", grade: "Grade 11", room: "102", time: "13:30", duration: 45 }
        ];
        localStorage.setItem('teacherSchedule', JSON.stringify(scheduleData));
        renderSchedule();
        alert("Sample schedule added!");
    };
    
    window.clearAllData = function() {
        if (confirm('Clear all schedule data?')) {
            localStorage.removeItem('teacherSchedule');
            scheduleData = [];
            renderSchedule();
        }
    };
    
    // ============ NEW ADVANCED FEATURES ============
    
    // View Toggle Functionality
    const viewOptions = document.querySelectorAll('.view-option');
    if (viewOptions.length > 0) {
        viewOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all
                document.querySelectorAll('.view-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                // Add active to clicked
                this.classList.add('active');
                const viewType = this.dataset.view;
                
                switch(viewType) {
                    case 'today':
                        renderTodayView();
                        break;
                    case 'week':
                        renderWeekView();
                        break;
                    case 'all':
                        renderAllView();
                        break;
                }
            });
        });
    }

    function renderTodayView() {
        renderSchedule();
        const bellSchedule = document.getElementById('bellSchedule');
        if (bellSchedule) bellSchedule.style.display = 'none';
    }

    function renderWeekView() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let html = '<h3><i class="fas fa-calendar-week"></i> Weekly Schedule</h3>';
        
        for (let i = 1; i <= 5; i++) { // Mon-Fri
            const dayClasses = scheduleData.filter(item => 
                item.days && item.days.includes(i)
            );
            
            if (dayClasses.length > 0) {
                html += `<div class="day-section" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">`;
                html += `<h4>${days[i]}</h4>`;
                
                dayClasses.forEach(item => {
                    const endTime = calculateEndTime(item.time, item.duration);
                    html += `
                        <div class="schedule-item" style="background: white; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 4px solid #3498db;">
                            <strong>${item.subject}</strong> (${item.grade})<br>
                            <small>${formatTime(item.time)}-${endTime} • Room ${item.room}</small>
                        </div>
                    `;
                });
                
                html += `</div>`;
            }
        }
        
        if (scheduleList) scheduleList.innerHTML = html;
    }

    function renderAllView() {
        let html = '<h3><i class="fas fa-list-alt"></i> All Classes</h3>';
        
        // Group by subject
        const subjects = {};
        scheduleData.forEach(item => {
            if (!subjects[item.subject]) {
                subjects[item.subject] = [];
            }
            subjects[item.subject].push(item);
        });
        
        Object.keys(subjects).forEach(subject => {
            html += `<div class="subject-group" style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">`;
            html += `<h4>${subject}</h4>`;
            
            subjects[subject].forEach(item => {
                const daysText = item.days ? item.days.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ') : 'Daily';
                html += `
                    <div style="background: white; padding: 10px; margin: 5px 0; border-radius: 5px;">
                        ${item.grade} • ${daysText} • ${formatTime(item.time)} • Room ${item.room}
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        if (scheduleList) scheduleList.innerHTML = html;
    }

    // Statistics
    function updateStats() {
        const today = new Date().getDay();
        const todayItems = scheduleData.filter(item => 
            item.days && item.days.includes(today)
        ).length;
        
        const weekItems = scheduleData.filter(item => 
            item.days && item.days.some(day => day >= 1 && day <= 5)
        ).length;
        
        // Find next class
        let nextClassTime = '--:--';
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const upcoming = scheduleData
            .filter(item => item.days && item.days.includes(today) && item.time > currentTime)
            .sort((a, b) => a.time.localeCompare(b.time));
        
        if (upcoming.length > 0) {
            nextClassTime = formatTime(upcoming[0].time);
        }
        
        // Update UI if elements exist
        const todayCount = document.getElementById('todayCount');
        const weekCount = document.getElementById('weekCount');
        const totalCount = document.getElementById('totalCount');
        const nextClass = document.getElementById('nextClass');
        
        if (todayCount) todayCount.textContent = todayItems;
        if (weekCount) weekCount.textContent = weekItems;
        if (totalCount) totalCount.textContent = scheduleData.length;
        if (nextClass) nextClass.textContent = nextClassTime;
    }

    // Export Functions
    window.printSchedule = function() {
        window.print();
    };

    window.exportToPDF = function() {
        alert("PDF export would require a library like jsPDF. For now, use Print → Save as PDF.");
        window.print();
    };

    window.exportToCSV = function() {
        let csv = 'Subject,Grade,Room,Time,Duration,Days\n';
        
        scheduleData.forEach(item => {
            const days = item.days ? item.days.join(';') : '1;2;3;4;5';
            csv += `"${item.subject}","${item.grade}","${item.room}","${item.time}","${item.duration}","${days}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'teacher_schedule.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Simple toast
        const toast = document.createElement('div');
        toast.textContent = 'Schedule exported as CSV!';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#2ecc71;color:white;padding:10px 15px;border-radius:5px;z-index:1000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // Settings Functions
    window.toggleSettings = function() {
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
            
            // Load current settings
            const settings = JSON.parse(localStorage.getItem('teacherSettings')) || {};
            const notificationsToggle = document.getElementById('notificationsToggle');
            const reminderTime = document.getElementById('reminderTime');
            
            if (notificationsToggle) notificationsToggle.checked = settings.notifications !== false;
            if (reminderTime) reminderTime.value = settings.reminderTime || '10';
        }
    };

    window.saveSettings = function() {
        const settings = {
            notifications: document.getElementById('notificationsToggle') ? document.getElementById('notificationsToggle').checked : true,
            reminderTime: document.getElementById('reminderTime') ? document.getElementById('reminderTime').value : '10'
        };
        
        localStorage.setItem('teacherSettings', JSON.stringify(settings));
        
        // Simple toast
        const toast = document.createElement('div');
        toast.textContent = 'Settings saved!';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#2ecc71;color:white;padding:10px 15px;border-radius:5px;z-index:1000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        const panel = document.getElementById('settingsPanel');
        if (panel) panel.style.display = 'none';
    };

    // Bell Schedule
    const defaultBellSchedule = [
        { period: 1, start: "08:00", end: "08:45" },
        { period: 2, start: "08:50", end: "09:35" },
        { period: 3, start: "09:40", end: "10:25" },
        { period: 4, start: "10:30", end: "11:15" },
        { period: 5, start: "11:20", end: "12:05" },
        { period: 6, start: "13:00", end: "13:45" },
        { period: 7, start: "13:50", end: "14:35" },
        { period: 8, start: "14:40", end: "15:25" }
    ];

    window.setupBellSchedule = function() {
        let html = '<h3>Configure Bell Schedule</h3>';
        
        defaultBellSchedule.forEach((bell, index) => {
            html += `
                <div style="display: flex; gap: 10px; margin: 10px 0; align-items: center;">
                    <span style="min-width: 80px;">Period ${bell.period}:</span>
                    <input type="time" value="${bell.start}" id="bellStart${index}">
                    <span>to</span>
                    <input type="time" value="${bell.end}" id="bellEnd${index}">
                </div>
            `;
        });
        
        html += `
            <button class="btn primary" onclick="saveBellSchedule()" style="width: 100%; margin-top: 20px;">
                Save Bell Schedule
            </button>
        `;
        
        if (scheduleList) scheduleList.innerHTML = html;
    };

    window.saveBellSchedule = function() {
        const bells = defaultBellSchedule.map((bell, index) => ({
            period: bell.period,
            start: document.getElementById(`bellStart${index}`).value,
            end: document.getElementById(`bellEnd${index}`).value
        }));
        
        localStorage.setItem('bellSchedule', JSON.stringify(bells));
        
        // Simple toast
        const toast = document.createElement('div');
        toast.textContent = 'Bell schedule saved!';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#2ecc71;color:white;padding:10px 15px;border-radius:5px;z-index:1000;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        renderTodayView();
    };

    // Show bell schedule
    function showBellSchedule() {
        const bells = JSON.parse(localStorage.getItem('bellSchedule')) || defaultBellSchedule;
        let html = '';
        
        bells.forEach(bell => {
            html += `
                <div class="bell-item">
                    <span>Period ${bell.period}</span>
                    <span>${formatTime(bell.start)} - ${formatTime(bell.end)}</span>
                </div>
            `;
        });
        
        const bellList = document.getElementById('bellList');
        const bellSchedule = document.getElementById('bellSchedule');
        
        if (bellList) bellList.innerHTML = html;
        if (bellSchedule) bellSchedule.style.display = 'block';
    }

    // Initialize
    renderSchedule();
    updateStats();
    showBellSchedule();
        // Settings Functions
    window.toggleSettings = function() {
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
            
            // Load current settings
            const settings = JSON.parse(localStorage.getItem('teacherSettings')) || {};
            const notificationsToggle = document.getElementById('notificationsToggle');
            const reminderTime = document.getElementById('reminderTime');
            
            if (notificationsToggle) {
                notificationsToggle.checked = settings.notifications !== false;
            }
            if (reminderTime) {
                reminderTime.value = settings.reminderTime || '10';
            }
        }
    };

    window.selectColor = function(subject) {
        alert(`Color selected for ${subject}. This would change subject colors in a full version.`);
    };

    window.saveSettings = function() {
        const settings = {
            notifications: document.getElementById('notificationsToggle') ? 
                         document.getElementById('notificationsToggle').checked : true,
            reminderTime: document.getElementById('reminderTime') ? 
                         document.getElementById('reminderTime').value : '10',
            lastSaved: new Date().toISOString()
        };
        
        localStorage.setItem('teacherSettings', JSON.stringify(settings));
        
        // Show confirmation
        alert('Settings saved successfully!');
        
        // Hide settings panel
        const panel = document.getElementById('settingsPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    };

    // Load settings on startup
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('teacherSettings')) || {};
        console.log('Loaded settings:', settings);
        
        // Apply settings if needed
        if (settings.reminderTime) {
            console.log(`Reminders set to ${settings.reminderTime} minutes before class`);
        }
    }

    // Call this at the end of your DOMContentLoaded function
    loadSettings();
    console.log("App setup complete!");
});// BONUS: Quick Attendance
window.takeAttendance = function(classIndex) {
    const className = scheduleData[classIndex].subject;
    const students = JSON.parse(localStorage.getItem('students')) || [
        "Student 1", "Student 2", "Student 3", "Student 4", "Student 5"
    ];
    
    let html = `<h3>Attendance for ${className}</h3>`;
    students.forEach((student, idx) => {
        html += `
            <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                <span>${student}</span>
                <div>
                    <button onclick="markAttendance(${classIndex}, ${idx}, 'present')" style="
                        background: #2ecc71; color: white; border: none; padding: 5px 10px; border-radius: 5px; margin-right: 5px;
                    ">Present</button>
                    <button onclick="markAttendance(${classIndex}, ${idx}, 'absent')" style="
                        background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px;
                    ">Absent</button>
                </div>
            </div>
        `;
    });
    
    // Show in schedule list
    document.getElementById('scheduleList').innerHTML = html;
};

window.markAttendance = function(classIndex, studentIndex, status) {
    const attendance = JSON.parse(localStorage.getItem('attendance')) || {};
    const classId = scheduleData[classIndex].subject + '_' + new Date().toDateString();
    
    if (!attendance[classId]) attendance[classId] = {};
    attendance[classId][studentIndex] = status;
    
    localStorage.setItem('attendance', JSON.stringify(attendance));
    alert(`Marked as ${status}`);
};