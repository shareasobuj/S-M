// LocalStorage মেমোরি ইনিশিয়ালাইজেশন
if (!localStorage.getItem('du_notices')) {
    localStorage.setItem('du_notices', JSON.stringify([
        { id: 1, type: 'general', title: 'শতবর্ষ উদযাপন ও সেমিনার সংক্রান্ত নোটিশ', desc: 'আগামী সপ্তাহে নবাব নওয়াব আলী চৌধুরী সিনেট ভবনে বিশেষ আন্তর্জাতিক সেমিনার অনুষ্ঠিত হবে।', date: '১৭ জুন, ২০২৬' }
    ]));
}
if (!localStorage.getItem('du_faculty')) {
    localStorage.setItem('du_faculty', JSON.stringify([
        { id: 1, name: 'অধ্যাপক ড. এম. এ. রহমান', designation: 'বিভাগীয় প্রধান, সিএসই', bio: 'গবেষণার ক্ষেত্র: কৃত্রিম বুদ্ধিমত্তা এবং ডেটা সায়েন্স।', img: 'https://via.placeholder.com/150' }
    ]));
}

// পেজ লোড ইভেন্ট
document.addEventListener("DOMContentLoaded", () => {
    renderDUNotices();
    renderDUFaculty();
    checkAdminAuth();
});

// মডাল টগল
function toggleAdminModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

// অ্যাডমিন অথেন্টিকেশন
function loginAdmin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === "admin" && pass === "1234") {
        sessionStorage.setItem('duAdmin', 'true');
        checkAdminAuth();
        toggleAdminModal();
        alert("ঢাকা বিশ্ববিদ্যালয় এডুকেশন পোর্টাল ড্যাশবোর্ডে স্বাগতম!");
    } else {
        alert("ভুল ক্রেডেনশিয়াল! সঠিক তথ্য দিন।");
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('duAdmin');
    checkAdminAuth();
    alert("সফলভাবে লগআউট করা হয়েছে।");
}

function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('duAdmin') === 'true';
    document.getElementById('adminPanel').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('adminBtn').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('logoutBtn').style.display = isLoggedIn ? 'inline-block' : 'none';
    
    // বাটন রি-রেন্ডার করার জন্য
    renderDUNotices();
    renderDUFaculty();
}

// নোটিশ CRUD
function addDUNotice() {
    const type = document.getElementById('noticeType').value;
    const title = document.getElementById('noticeTitle').value;
    const desc = document.getElementById('noticeDesc').value;

    if (!title || !desc) return alert("দয়া করে শিরোনাম এবং বিবরণ লিখুন!");

    const notices = JSON.parse(localStorage.getItem('du_notices'));
    const banglaDate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    notices.unshift({ id: Date.now(), type, title, desc, date: banglaDate });
    localStorage.setItem('du_notices', JSON.stringify(notices));

    // ইনপুট ফিল্ড ক্লিয়ার
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeDesc').value = '';

    renderDUNotices();
}

function renderDUNotices() {
    const notices = JSON.parse(localStorage.getItem('du_notices'));
    const container = document.getElementById('duNoticeContainer');
    const isAdmin = sessionStorage.getItem('duAdmin') === 'true';

    container.innerHTML = notices.map(notice => `
        <div class="notice-block">
            <div class="n-meta">[${notice.type.toUpperCase()}] - প্রকাশিত: ${notice.date}</div>
            <h3>${notice.title}</h3>
            <p style="font-size: 14px; color:#555; margin-top:5px;">${notice.desc}</p>
            ${isAdmin ? `<button class="btn-del" onclick="deleteDUNotice(${notice.id})">মুছে ফেলুন</button>` : ''}
        </div>
    `).join('');
}

function deleteDUNotice(id) {
    let notices = JSON.parse(localStorage.getItem('du_notices'));
    notices = notices.filter(n => n.id !== id);
    localStorage.setItem('du_notices', JSON.stringify(notices));
    renderDUNotices();
}

// ফ্যাকাল্টি CRUD
function addDUFaculty() {
    const name = document.getElementById('facName').value;
    const designation = document.getElementById('facDesignation').value;
    const bio = document.getElementById('facBio').value;
    let img = document.getElementById('facImg').value;

    if (!name || !designation) return alert("নাম এবং পদবী অবশ্যই দিতে হবে!");
    if (!img) img = 'https://via.placeholder.com/150';

    const faculties = JSON.parse(localStorage.getItem('du_faculty'));
    faculties.push({ id: Date.now(), name, designation, bio, img });
    localStorage.setItem('du_faculty', JSON.stringify(faculties));

    // ক্লিয়ার ফিল্ড
    document.getElementById('facName').value = '';
    document.getElementById('facDesignation').value = '';
    document.getElementById('facBio').value = '';
    document.getElementById('facImg').value = '';

    renderDUFaculty();
}

function renderDUFaculty() {
    const faculties = JSON.parse(localStorage.getItem('du_faculty'));
    const container = document.getElementById('duFacultyContainer');
    const isAdmin = sessionStorage.getItem('duAdmin') === 'true';

    if(faculties.length === 0) {
        container.innerHTML = "<p>কোনো শিক্ষক প্রোফাইল পাওয়া যায়নি।</p>";
        return;
    }

    container.innerHTML = faculties.map(fac => `
        <div class="faculty-card">
            <img src="${fac.img}" alt="${fac.name}">
            <h4>${fac.name}</h4>
            <p style="color: #c0392b; font-weight:bold; font-size:13px; margin:4px 0;">${fac.designation}</p>
            <p style="font-size:12px; color:#666;">${fac.bio}</p>
            ${isAdmin ? `<button class="btn-del" onclick="deleteDUFaculty(${fac.id})">প্রোফাইল বাদ দিন</button>` : ''}
        </div>
    `).join('');
}

function deleteDUFaculty(id) {
    let faculties = JSON.parse(localStorage.getItem('du_faculty'));
    faculties = faculties.filter(f => f.id !== id);
    localStorage.setItem('du_faculty', JSON.stringify(faculties));
    renderDUFaculty();
        }
