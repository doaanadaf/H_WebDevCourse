// ===== Global data =====
let songs = [];
let currentSort = 'date'; // 'date' | 'name' | 'rating'
let isCardsView = false;

// ===== DOM refs =====
const form = document.getElementById('songForm');
const titleInput = document.getElementById('title');
const urlInput = document.getElementById('url');
const ratingInput = document.getElementById('rating');
const songIdInput = document.getElementById('songId');
const submitBtn = document.getElementById('submitBtn');

const tableBody = document.getElementById('songList');
const cardsView = document.getElementById('cardsView');
const tableView = document.getElementById('tableView');
const songCountSpan = document.getElementById('songCount');
const searchInput = document.getElementById('search');
const toggleViewBtn = document.getElementById('toggleViewBtn');

// Modal
const playerModalEl = document.getElementById('playerModal');
const playerTitleEl = document.getElementById('playerTitle');
const playerIframe = document.getElementById('playerIframe');
const playerModal = new bootstrap.Modal(playerModalEl);

// ===== Utils: YouTube ID & Thumbnail =====
function extractYouTubeId(url) {
    const reg = /(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/;
    const match = url.match(reg);
    return match ? match[1] : null;
}

function getThumbnailUrl(url) {
    const id = extractYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

// ===== Local Storage =====
function loadFromStorage() {
    const stored = localStorage.getItem('songs');
    songs = stored ? JSON.parse(stored) : [];
}

function saveToStorage() {
    localStorage.setItem('songs', JSON.stringify(songs));
}

// ===== Render =====
function renderAll() {
    let arr = [...songs];

    // חיפוש לפי כותרת
    const term = searchInput.value.trim().toLowerCase();
    if (term) {
        arr = arr.filter(s => s.title.toLowerCase().includes(term));
    }

    // מיון לפי בחירת RADIO
    switch (currentSort) {
        case 'name':
            arr.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'rating':
            arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'date':
        default:
            // חדש קודם
            arr.sort((a, b) => b.dateAdded - a.dateAdded);
            break;
    }

    renderTable(arr);
    renderCards(arr);
    songCountSpan.textContent = arr.length;
}

function renderTable(arr) {
    tableBody.innerHTML = '';

    arr.forEach(song => {
        const tr = document.createElement('tr');

        const thumbHtml = song.thumbnail
            ? `<img src="${song.thumbnail}" alt="${song.title}" class="img-fluid rounded">`
            : '';

        tr.innerHTML = `
            <td>${song.title}</td>
            <td>
                <a href="${song.url}" target="_blank" class="text-info">Watch on YouTube</a>
            </td>
            <td>${song.rating ?? '-'}</td>
            <td>${thumbHtml}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-info me-2" onclick="playSong(${song.id})">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-sm btn-warning me-2" onclick="editSong(${song.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderCards(arr) {
    cardsView.innerHTML = '';

    arr.forEach(song => {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3';

        const thumbHtml = song.thumbnail
            ? `<img src="${song.thumbnail}" alt="${song.title}" class="thumb-img card-img-top">`
            : '';

        col.innerHTML = `
            <div class="card h-100 bg-dark border-primary">
                ${thumbHtml}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${song.title}</h5>
                    <p class="card-text mb-1">
                        <strong>Rating:</strong> ${song.rating ?? '-'}
                    </p>
                    <div class="mb-2">
                        <button class="btn btn-sm btn-success me-2" onclick="playSong(${song.id})">
                            <i class="fab fa-youtube"></i> Play
                        </button>
                        <a href="${song.url}" target="_blank" class="btn btn-sm btn-outline-info">
                            Open Page
                        </a>
                    </div>
                    <div class="mt-auto d-flex justify-content-between">
                        <button class="btn btn-sm btn-warning" onclick="editSong(${song.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSong(${song.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        cardsView.appendChild(col);
    });
}

// ===== Add / Update via form =====
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    const rating = Number(ratingInput.value);

    if (!title || !url || !rating || rating < 1 || rating > 10) {
        alert('Please enter title, valid YouTube URL and rating 1-10');
        return;
    }

    const thumb = getThumbnailUrl(url);

    if (songIdInput.value) {
        // עדכון רשומה קיימת
        const id = Number(songIdInput.value);
        const song = songs.find(s => s.id === id);
        if (song) {
            song.title = title;
            song.url = url;
            song.rating = rating;
            song.thumbnail = thumb;
        }
    } else {
        // הוספת רשומה חדשה
        const newSong = {
            id: Date.now(),
            title,
            url,
            rating,
            dateAdded: Date.now(),
            thumbnail: thumb
        };
        songs.push(newSong);
    }

    saveToStorage();
    renderAll();

    // ניקוי טופס וחזרה למצב "Add"
    form.reset();
    songIdInput.value = '';
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
    submitBtn.classList.remove('btn-warning');
    submitBtn.classList.add('btn-success');
});

// ===== מחיקה =====
function deleteSong(id) {
    if (!confirm('Delete this song?')) return;
    songs = songs.filter(s => s.id !== id);
    saveToStorage();
    renderAll();
}

// ===== עריכה – טעינת הנתונים לטופס =====
function editSong(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    titleInput.value = song.title;
    urlInput.value = song.url;
    ratingInput.value = song.rating ?? '';
    songIdInput.value = song.id;

    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update';
    submitBtn.classList.remove('btn-success');
    submitBtn.classList.add('btn-warning');
}

// ===== נגן כחלון נפתח (Modal) =====
function playSong(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    const vidId = extractYouTubeId(song.url);
    if (!vidId) {
        alert('Cannot detect YouTube video ID from this URL');
        return;
    }

    playerTitleEl.textContent = song.title;
    playerIframe.src = `https://www.youtube.com/embed/${vidId}?autoplay=1`;
    playerModal.show();
}

// לעצור את הווידאו כשסוגרים את המודאל
playerModalEl.addEventListener('hidden.bs.modal', () => {
    playerIframe.src = '';
});

// ===== תצוגה דו־מצבית (טבלה / כרטיסים) =====
toggleViewBtn.addEventListener('click', () => {
    isCardsView = !isCardsView;

    if (isCardsView) {
        tableView.classList.add('d-none');
        cardsView.classList.remove('d-none');
        toggleViewBtn.innerHTML = '<i class="fas fa-th-large"></i>';
    } else {
        tableView.classList.remove('d-none');
        cardsView.classList.add('d-none');
        toggleViewBtn.innerHTML = '<i class="fas fa-table"></i>';
    }
});

// ===== מיון לפי RADIO BUTTONS =====
document.querySelectorAll('input[name="sortBy"]').forEach(r => {
    r.addEventListener('change', () => {
        currentSort = r.value;
        renderAll();
    });
});

// ===== חיפוש =====
searchInput.addEventListener('input', renderAll);

// ===== טעינה ראשונית מה־LOCALSTORAGE בעת עליית הדף =====
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();   // קורא מה localStorage
    renderAll();         // מציג את הרשימה ישר בעליית הדף
});

// לחשוף פונקציות ל-onclick ב-HTML
window.deleteSong = deleteSong;
window.editSong = editSong;
window.playSong = playSong;
