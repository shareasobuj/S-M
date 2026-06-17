// প্রাথমিক ডাটা চেক এবং ব্রাউজার মেমোরি সেটআপ
if (!localStorage.getItem('notices')) localStorage.setItem('notices', JSON.stringify([]));
if (!localStorage.getItem('members')) localStorage.setItem('members', JSON.stringify([]));

// ডক এলিমেন্ট লোড হলে ডাটা শো করবে
document.addEventListener("DOMContentLoaded", () => {
    renderNotices();
    renderMembers();
    checkLoginState();
});

// --- অ্যাডমিন অথেন্টিকেশন (লগইন / সাইন ইন সিস্টেম) ---
function toggleAdminModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

function loginAdmin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // সিকিউরড লগইন ক্রেডেনশিয়াল (আপনি চাইলে পরিবর্তন করতে পারেন)
    if (user === "admin" && pass === "1234") {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        checkLoginState();
        toggleAdminModal();
        alert("অ্যাডমিন হিসেবে সফলভাবে লগইন হয়েছে!");
    } else {
        alert("ভুল ইউজারনেম অথবা পাসওয়ার্ড!");
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('isAdminLoggedIn');
    checkLoginState();
    alert("লগআউট করা হয়েছে।");
}

function checkLoginState() {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    const adminPanel = document.getElementById('adminPanel');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isLoggedIn === 'true') {
        adminPanel.style.display = 'block';
        adminBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        adminPanel.style.display = 'none';
        adminBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
    // প্রতিবার লগইন স্টেট পরিবর্তনের পর ডাটা রি-রেন্ডার হবে বাটন শো/হাইড করার জন্য
    renderNotices();
    renderMembers();
}

// --- নোটিশ বোর্ড CRUD অপারেশন ---
function saveNotice() {
    const title = document.getElementById('noticeTitle').value;
    const desc = document.getElementById('noticeDesc').value;
    if (!title || !desc) return alert("অনুগ্রহ করে সব ঘর পূরণ করুন!");

    const notices = JSON.parse(localStorage.getItem('notices'));
    const date = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    notices.unshift({ id: Date.now(), title, desc, date }); // নতুন নোটিশ শুরুতে থাকবে
    localStorage.setItem('notices', JSON.stringify(notices));

    // ফর্ম ক্লিয়ার
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeDesc').value = '';

    renderNotices();
}

function renderNotices() {
    const notices = JSON.parse(localStorage.getItem('notices'));
    const container = document.getElementById('noticeContainer');
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    
    if (notices.length === 0) {
        container.innerHTML = "<p>বর্তমানে কোনো নোটিশ নেই।</p>";
        return;
    }

    container.innerHTML = notices.map(notice => `
        <div class="notice-item">
            <h3>${notice.title}</h3>
            <p class="notice-date">প্রকাশের তারিখ: ${notice.date}</p>
            <p>${notice.desc}</p>
            ${isAdmin ? `
                <div class="crud-buttons">
                    <button class="btn-delete" onclick="deleteNotice(${notice.id})">ডিলিট</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function deleteNotice(id) {
    let notices = JSON.parse(localStorage.getItem('notices'));
    notices = notices.filter(n => n.id !== id);
    localStorage.setItem('notices', JSON.stringify(notices));
    renderNotices();
}


// --- শিক্ষক ও শিক্ষার্থী ম্যানেজমেন্ট (CRUD) ---
function saveMember() {
    const role = document.getElementById('memberRole').value;
    const name = document.getElementById('memberName').value;
    const bio = document.getElementById('memberBio').value;
    let img = document.getElementById('memberImg').value;

    if (!name || !bio) return alert("নাম এবং বায়োডাটা আবশ্যক!");
    // ইমেজ ফাকা থাকলে ডিফল্ট ডামি ইমেজ বসবে
    if (!img) img = "https://via.placeholder.com/150";

    const members = JSON.parse(localStorage.getItem('members'));
    members.push({ id: Date.now(), role, name, bio, img });
    localStorage.setItem('members', JSON.stringify(members));

    // ফর্ম রিসেট
    document.getElementById('memberName').value = '';
    document.getElementById('memberBio').value = '';
    document.getElementById('memberImg').value = '';

    renderMembers();
}

function renderMembers() {
    const members = JSON.parse(localStorage.getItem('members'));
    const teachersContainer = document.getElementById('teachersContainer');
    const studentsContainer = document.getElementById('studentsContainer');
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';

    // কন্টেইনার খালি করা
    teachersContainer.innerHTML = '';
    studentsContainer.innerHTML = '';

    let hasTeachers = false;
    let hasStudents = false;

    members.forEach(member => {
        const cardHTML = `
            <div class="profile-card">
                <img src="${member.img}" alt="${member.name}">
                <h4>${member.name}</h4>
                <p style="font-size:14px; color:#555;">${member.bio}</p>
                ${isAdmin ? `
                    <div class="crud-buttons">
                        <button class="btn-delete" onclick="deleteMember(${member.id})">ডিলিট</button>
                    </div>
                ` : ''}
            </div>
        `;

        if (member.role === 'teacher') {
            teachersContainer.innerHTML += cardHTML;
            hasTeachers = true;
        } else if (member.role === 'student') {
            studentsContainer.innerHTML += cardHTML;
            hasStudents = true;
        }
    });

    if (!hasTeachers) teachersContainer.innerHTML = "<p>কোনো শিক্ষকের তথ্য পাওয়া যায়নি।</p>";
    if (!hasStudents) studentsContainer.innerHTML = "<p>কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।</p>";
}

function deleteMember(id) {
    let members = JSON.parse(localStorage.getItem('members'));
    members = members.filter(m => m.id !== id);
    localStorage.setItem('members', JSON.stringify(members));
    renderMembers();
      }
