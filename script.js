// Communities organized by state
const communitiesData = {
    Georgia: [
        { id: 1,  name: "Madison Heights Enterprise",    location: "Enterprise",  files: [] },
        { id: 2,  name: "Madison at The Range",          location: "Madison",     files: [] },
        { id: 3,  name: "The Goldton at Athens",         location: "Athens",      files: [] },
        { id: 4,  name: "The Goldton at Jones Farm",     location: "Atlanta",     files: [] },
        { id: 5,  name: "Madison Heights Evans",         location: "Evans",       files: [] },
        { id: 6,  name: "Legacy at Savannah Quarters",  location: "Pooler",      files: [] },
        { id: 7,  name: "Legacy Ridge at Alpharetta",   location: "Alpharetta",  files: [] },
        { id: 8,  name: "Legacy Ridge at Buckhead",     location: "Atlanta",     files: [] },
        { id: 9,  name: "Legacy Ridge at Marietta",     location: "Marietta",    files: [] },
        { id: 10, name: "The Canopy at Westridge",      location: "McDonough",   files: [] },
        { id: 11, name: "The Overlook at Suwanee",      location: "Suwanee",     files: [] }
    ],
    Florida: [
        { id: 12, name: "Kelley Place",                  location: "Enterprise",    files: [] },
        { id: 13, name: "Monark Grove Madison",          location: "Madison",       files: [] },
        { id: 14, name: "Monark Grove Greystone",        location: "Greystone",     files: [] },
        { id: 15, name: "Madison at Clermont",           location: "Clermont",      files: [] },
        { id: 16, name: "Madison at Ocoee",              location: "Ocoee",         files: [] },
        { id: 17, name: "Madison at Oviedo",             location: "Oviedo",        files: [] },
        { id: 18, name: "The Goldton at Venice",         location: "Venice",        files: [] },
        { id: 19, name: "The Goldton at St. Petersburg", location: "St. Petersburg",files: [] },
        { id: 20, name: "Lake Howard Heights",           location: "Winter Haven",  files: [] },
        { id: 21, name: "The Canopy At Beacon Woods",   location: "Winter Park",   files: []},
        { id: 22, name: "The Goldton At Lake Nona",     location: "Lake Nona",     files: [] }
    ],
    Mississippi: [
        { id: 23, name: "The Goldton at Southaven", location: "Southaven", files: [] },
        { id: 24, name: "The Goldton at Adelaide",  location: "Starkville", files: [] }
    ],
    "South Carolina": [
        { id: 25, name: "Oakview Park",                  location: "Greenville",    files: [] },
        { id: 26, name: "Spring Park",                   location: "Travelers Rest",files: [] },
        { id: 27, name: "Legacy Reserve Fairview Park",  location: "Simpsonville",  files: [] },
        { id: 28, name: "Wildcat Senior Living",         location: "Summerville",   files: [] }
    ],
    Tennessee: [
        { id: 29, name: "The Goldton at Spring Hill", location: "Spring Hill", files: [] }
    ],
    Texas: [
        { id: 30, name: "The Oscar at Georgetown", location: "Georgetown",  files: [] },
        { id: 31, name: "The Oscar at Veramendi",  location: "San Antonio", files: [] }
    ],
    Maryland: [
        { id: 32, name: "Tribute at Black Hill", location: "Black Hill", files: [] },
        { id: 33, name: "Tribute at Melford",    location: "Melford",    files: [] }
    ],
    Virginia: [
        { id: 34, name: "Tribute at One Loudoun", location: "Loudoun", files: [] },
        { id: 35, name: "Tribute at The Glen",    location: "Glen",    files: [] }
    ]
};

// ─── Firestore helpers ────────────────────────────────────────────────────────

const FIRESTORE_DOC = "repository/files";

async function saveToStorage() {
    const db  = window._db;
    const ref = window._firestoreDoc(db, "repository", "files");

    const snapshot = {};
    Object.entries(communitiesData).forEach(([state, communities]) => {
        snapshot[state] = communities.map(c => ({ id: c.id, files: c.files }));
    });

    try {
        await window._firestoreSetDoc(ref, snapshot);
        console.log("✅ Saved to Firestore");
    } catch (e) {
        console.error("❌ Firestore save failed:", e);
        alert("Save failed. Check your internet connection and try again.");
    }
}

async function loadFromStorage() {
    const db  = window._db;
    const ref = window._firestoreDoc(db, "repository", "files");

    try {
        const snap = await window._firestoreGetDoc(ref);
        if (!snap.exists()) {
            console.log("No data in Firestore yet — starting fresh.");
            return;
        }
        const snapshot = snap.data();
        Object.entries(snapshot).forEach(([state, savedComs]) => {
            if (!communitiesData[state]) return;
            savedComs.forEach(savedCom => {
                const live = communitiesData[state].find(c => c.id === savedCom.id);
                if (live && savedCom.files && savedCom.files.length > 0) {
                    // Only keep real files (those with a URL). Legacy sample/demo
                    // entries have no url and should not be shown.
                    live.files = savedCom.files.filter(f => f.url);
                }
            });
        });
        console.log("✅ Loaded from Firestore");
    } catch (e) {
        console.error("❌ Firestore load failed:", e);
    }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

let searchQuery = '';

// View mode: 'grid' (cards) or 'list' (compact rows). Persisted per browser.
let currentView = (function () {
    try { return localStorage.getItem('repoView') || 'grid'; } catch (e) { return 'grid'; }
})();

function setView(view) {
    currentView = (view === 'list') ? 'list' : 'grid';
    try { localStorage.setItem('repoView', currentView); } catch (e) {}
    updateViewToggle();
    renderCommunities();
}

function updateViewToggle() {
    const gridBtn = document.getElementById('viewGridBtn');
    const listBtn = document.getElementById('viewListBtn');
    if (!gridBtn || !listBtn) return;
    const active   = { background: 'rgba(34,94,100,0.10)', color: '#225e64' };
    const inactive = { background: 'transparent', color: '#6b7280' };
    const g = currentView === 'grid' ? active : inactive;
    const l = currentView === 'list' ? active : inactive;
    gridBtn.style.background = g.background; gridBtn.style.color = g.color;
    listBtn.style.background = l.background; listBtn.style.color = l.color;
}

// Map a filename/extension to a logical file type. Unknown extensions return
// 'file' (NOT 'pdf') so they aren't mislabeled or treated as PDFs.
function detectFileType(name) {
    const ext = String(name || '').split('.').pop().toLowerCase();
    if (ext === 'pdf')                                       return 'pdf';
    if (['doc', 'docx'].includes(ext))                      return 'word';
    if (['xls', 'xlsx', 'csv'].includes(ext))               return 'excel';
    if (['ai', 'psd', 'sketch', 'indd', 'idml', 'eps'].includes(ext)) return 'design';
    if (['zip', 'rar', '7z'].includes(ext))                 return 'archive';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'tif', 'tiff'].includes(ext)) return 'image';
    return 'file';
}

// Extract the extension from a filename or URL path.
function extOf(file) {
    let m = String(file.name || '').match(/\.([a-z0-9]+)$/i);
    if (m) return m[1].toLowerCase();
    if (file.url) {
        try {
            const path = decodeURIComponent(new URL(file.url).pathname);
            m = path.match(/\.([a-z0-9]+)$/i);
            if (m) return m[1].toLowerCase();
        } catch (e) {}
    }
    return '';
}

// Re-derive the real type from the name/URL — corrects older entries that were
// saved as 'pdf' by the previous (buggy) default.
function effectiveType(file) {
    const ext = extOf(file);
    if (ext) {
        const t = detectFileType('x.' + ext);
        if (t !== 'file') return t;
    }
    return file.type || 'file';
}

// Uppercase extension for the label (PDF, INDD, AI…), falling back to type.
function typeLabel(file) {
    const ext = extOf(file);
    return ext ? ext.toUpperCase() : (file.type || 'file').toUpperCase();
}

// A file is "new" for 40 days after the date it was added.
const NEW_FILE_DAYS = 40;

// Local YYYY-MM-DD (NOT UTC). new Date().toISOString() returns a UTC date,
// which can be "tomorrow" for timezones behind UTC and breaks the "new" check.
function localDateStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function isNewFile(file) {
    if (!file || !file.date) return false;
    const [y, m, d] = String(file.date).split('-').map(Number);
    if (!y || !m || !d) return false;
    const added = new Date(y, m - 1, d);
    const diffDays = (Date.now() - added.getTime()) / 86400000;
    // Allow a small negative window (-2) so timezone offsets in older entries
    // saved with a UTC date don't get excluded.
    return diffDays >= -2 && diffDays <= NEW_FILE_DAYS;
}

function communityHasNew(community) {
    return community.files.some(isNewFile);
}

function getAllFiles() {
    let allFiles = [];
    Object.values(communitiesData).forEach(stateCommunities => {
        stateCommunities.forEach(community => {
            allFiles = allFiles.concat(community.files);
        });
    });
    return allFiles;
}

function getAllCommunitiesCount() {
    let count = 0;
    Object.values(communitiesData).forEach(sc => { count += sc.length; });
    return count;
}

function renderCommunities() {
    const container  = document.getElementById('statesContainer');
    const emptyState = document.getElementById('emptyState');
    container.innerHTML = '';

    let hasResults  = false;
    const searchLow = searchQuery.toLowerCase();

    Object.entries(communitiesData).forEach(([state, communities]) => {
        const filtered = communities.filter(community => {
            if (searchLow === '') return true;
            const communityMatches =
                community.name.toLowerCase().includes(searchLow) ||
                community.location.toLowerCase().includes(searchLow);
            const fileMatches = community.files.some(f =>
                f.name.toLowerCase().includes(searchLow)
            );
            return communityMatches || fileMatches;
        });

        if (filtered.length === 0) return;
        hasResults = true;

        const stateSection = document.createElement('div');
        stateSection.className = 'animate-fade-in';

        const stateHeader = document.createElement('div');
        stateHeader.className = 'mb-6';
        stateHeader.innerHTML = `<h2 class="text-2xl font-light text-gray-700 tracking-tight">${state} <span class="text-gray-400 text-lg font-light">(${filtered.length})</span></h2>`;
        stateSection.appendChild(stateHeader);

        const grid = document.createElement('div');
        if (currentView === 'list') {
            grid.className = 'flex flex-col gap-2 mb-12';
            filtered.forEach(community => {
                grid.appendChild(createFolderRow(community));
            });
        } else {
            grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12';
            filtered.forEach(community => {
                grid.appendChild(createFolderCard(community));
            });
        }

        stateSection.appendChild(grid);
        container.appendChild(stateSection);
    });

    emptyState.classList.toggle('hidden', hasResults);
}

function createFolderCard(community) {
    const card = document.createElement('div');
    card.className = 'folder-card rounded-2xl p-6';
    card.onclick = () => openModal(community);

    const newBadge = communityHasNew(community)
        ? `<span class="new-badge" style="position:absolute;top:14px;right:14px;">Recently added</span>`
        : '';

    card.innerHTML = `
        ${newBadge}
        <div class="flex flex-col h-full">
            <div class="flex-1">
                <svg class="w-12 h-12 mb-4 opacity-70" style="color: #225e64;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 class="text-lg font-normal text-gray-700 mb-2 line-clamp-2">${community.name}</h3>
                <p class="text-sm text-gray-400 font-light flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ${community.location}
                </p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200/50">
                <span class="text-xs text-gray-500 font-light">
                    ${community.files.length} ${community.files.length === 1 ? 'file' : 'files'}
                </span>
            </div>
        </div>
    `;
    return card;
}

function createFolderRow(community) {
    const row = document.createElement('div');
    row.className = 'folder-row rounded-xl px-5 py-3 flex items-center gap-4 cursor-pointer';
    row.onclick = () => openModal(community);

    row.innerHTML = `
        <svg class="w-6 h-6 opacity-70 flex-shrink-0" style="color: #225e64;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <div class="flex-1 min-w-0 flex items-center gap-2">
            <h3 class="text-base font-normal text-gray-700 truncate">${community.name}</h3>
            ${communityHasNew(community) ? '<span class="new-badge flex-shrink-0">New</span>' : ''}
        </div>
        <p class="text-sm text-gray-400 font-light flex items-center gap-1 flex-shrink-0">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ${community.location}
        </p>
        <span class="text-xs text-gray-500 font-light flex-shrink-0 w-16 text-right">
            ${community.files.length} ${community.files.length === 1 ? 'file' : 'files'}
        </span>
    `;
    return row;
}

// Keep track of which community is open in the modal
let _modalCommunity = null;

function openModal(community) {
    _modalCommunity = community;
    const modal         = document.getElementById('fileModal');
    const modalTitle    = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');

    modalTitle.textContent = community.name;
    modalLocation.querySelector('span').textContent = community.location;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderModalFiles();
}

function renderModalFiles() {
    const community      = _modalCommunity;
    const modalFilesList = document.getElementById('modalFilesList');
    modalFilesList.innerHTML = '';

    if (community.files.length === 0) {
        modalFilesList.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 font-light">No files added yet for this community.</p>
            </div>`;
        return;
    }

    community.files.forEach(file => {
        const fileRow = document.createElement('div');
        fileRow.className = 'file-item flex justify-between items-center p-5 rounded-xl';
        fileRow.id = 'file-row-' + file.id;

        const fType = effectiveType(file);
        let typeIcon = '📄';
        if (fType === 'word')    typeIcon = '📝';
        if (fType === 'excel')   typeIcon = '📊';
        if (fType === 'image')   typeIcon = '🖼️';
        if (fType === 'archive') typeIcon = '🗜️';

        // Files added via Quick Links (a pasted URL) can be removed from the
        // repository. Uploaded S3 files are not deletable here.
        const isLink = file.source === 'link' || (!file.source && file.size === '—');
        const renameBtn = `
                <button
                        onclick="event.stopPropagation(); renameFile(${file.id})"
                        title="Rename" aria-label="Rename"
                        class="rename-btn ml-3 flex items-center justify-center rounded-xl transition-all"
                        style="width:44px;height:44px;flex-shrink:0;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>`;
        const deleteBtn = isLink ? `
                <button
                        onclick="event.stopPropagation(); deleteLinkFile(${file.id})"
                        title="Remove link" aria-label="Remove link"
                        class="delete-btn ml-3 flex items-center justify-center rounded-xl transition-all"
                        style="width:44px;height:44px;flex-shrink:0;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>` : '';

        fileRow.innerHTML = `
            <div class="flex-1">
                <p class="font-normal text-gray-700 flex items-center gap-3">
                    ${canThumbnail(file)
                        ? `<span id="thumb-${file.id}" class="pdf-thumb">${typeIcon}</span>`
                        : `<span class="text-2xl">${typeIcon}</span>`}
                    <span>${file.name}</span>
                    ${isNewFile(file) ? '<span class="new-badge">New</span>' : ''}
                </p>
                <p class="text-xs text-gray-400 font-light tracking-wide">${typeLabel(file)} • ${file.size} • ${formatDate(file.date)}</p>
            </div>
            <div class="flex items-center ml-6">
                <button
                        onclick="event.stopPropagation(); downloadFile(${file.id})"
                        class="download-btn text-gray-700 font-light py-3 px-6 rounded-xl transition-all whitespace-nowrap text-sm tracking-wide"
                    >
                        Download
                    </button>
                ${renameBtn}
                ${deleteBtn}
            </div>
        `;
        modalFilesList.appendChild(fileRow);
    });

    // Render small PDF thumbnails (first page) on demand, after the rows exist.
    community.files.forEach(file => {
        if (canThumbnail(file)) renderPdfThumb(file);
    });
}

// Thumbnails only work for PDFs served with permissive CORS — i.e. our own S3
// bucket. External links (Dropbox, etc.) block cross-origin fetch, so we keep
// the icon for them instead of failing with CORS errors in the console.
function canThumbnail(file) {
    return effectiveType(file) === 'pdf'
        && !!file.url
        && /amazonaws\.com/.test(file.url);
}

// Cache rendered thumbnails for the session so reopening a modal is instant.
const _pdfThumbCache = {};

async function renderPdfThumb(file) {
    const holder = document.getElementById('thumb-' + file.id);
    if (!holder) return;

    if (_pdfThumbCache[file.url]) {
        holder.innerHTML = `<img src="${_pdfThumbCache[file.url]}" alt="">`;
        return;
    }

    const lib = window.pdfjsLib;
    if (!lib) return; // library not loaded — keep the icon

    try {
        lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Download the whole file with a plain GET (CORS already allows GET) and
        // hand the bytes to PDF.js. This avoids range requests, which need extra
        // CORS headers (Content-Range/Accept-Ranges) that S3 isn't exposing.
        const resp = await fetch(file.url, { cache: 'force-cache' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.arrayBuffer();

        const pdf  = await lib.getDocument({ data }).promise;
        const page = await pdf.getPage(1);

        // Render at ~80px wide (crisp at small size), display scaled down by CSS.
        const base     = page.getViewport({ scale: 1 });
        const scale    = 80 / base.width;
        const viewport = page.getViewport({ scale });

        const canvas  = document.createElement('canvas');
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        _pdfThumbCache[file.url] = dataUrl;

        const current = document.getElementById('thumb-' + file.id);
        if (current) current.innerHTML = `<img src="${dataUrl}" alt="">`;
    } catch (e) {
        console.warn('PDF thumbnail failed for', file.name, e); // keep the icon
    }
}



function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    // Parse "YYYY-MM-DD" as LOCAL time, not UTC. Plain new Date("2026-05-30")
    // treats it as UTC midnight, which renders as the previous day in
    // timezones behind UTC (e.g. the Americas). Build it from parts instead.
    const [y, m, d] = dateString.split('-').map(Number);
    const date = (y && m && d) ? new Date(y, m - 1, d) : new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

function downloadFile(fileId) {
    let fileName = '';
    let fileUrl  = '';

    Object.values(communitiesData).forEach(stateCommunities => {
        stateCommunities.forEach(community => {
            const file = community.files.find(f => f.id === fileId);
            if (file) { fileName = file.name; fileUrl = file.url; }
        });
    });

    if (fileUrl) {
        window.open(fileUrl, '_blank');
    } else {
        alert(`Downloading: ${fileName}`);
    }
}

async function renameFile(fileId) {
    if (!requireAdmin()) return;

    let target = null;
    Object.values(communitiesData).forEach(stateCommunities => {
        stateCommunities.forEach(community => {
            const f = community.files.find(f => f.id === fileId);
            if (f) target = f;
        });
    });
    if (!target) return;

    const newName = prompt('Rename file:', target.name);
    if (newName === null) return;                 // cancelled
    const trimmed = newName.trim();
    if (!trimmed || trimmed === target.name) return;

    target.name = trimmed;                          // UI/display name only
    await saveToStorage();
    renderModalFiles();
    renderCommunities();
}

async function deleteLinkFile(fileId) {
    if (!requireAdmin()) return;

    let target = null, targetCommunity = null;
    Object.values(communitiesData).forEach(stateCommunities => {
        stateCommunities.forEach(community => {
            const f = community.files.find(f => f.id === fileId);
            if (f) { target = f; targetCommunity = community; }
        });
    });
    if (!target || !targetCommunity) return;

    if (!confirm(`Remove "${target.name}" from ${targetCommunity.name}?\n\nThis only removes the link from the repository — it does not delete anything in S3.`)) return;

    targetCommunity.files = targetCommunity.files.filter(f => f.id !== fileId);
    await saveToStorage();
    renderModalFiles();
    renderCommunities();
}

function searchCommunities() {
    searchQuery = document.getElementById('searchInput').value;
    renderCommunities();
}

function closeModal() {
    document.getElementById('fileModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ─── Add Quick Links (saves to Firestore) ─────────────────────────────────────

async function addQuickLinks() {
    const textarea        = document.getElementById('linksPaste');
    const communitySelect = document.getElementById('communitySelect');
    const customNameInput = document.getElementById('customName');
    const urls            = textarea.value.trim().split('\n').filter(u => u.trim());
    const customName      = customNameInput.value.trim();

    if (urls.length === 0) { alert('Please paste at least one S3 URL'); return; }
    if (!communitySelect.value) { alert('Please select a community'); return; }

    const [stateName, communityId] = communitySelect.value.split('|');
    const state     = communitiesData[stateName];
    const community = state.find(c => c.id === parseInt(communityId));
    if (!community) { alert('Error: Community not found'); return; }

    // Next ID
    let nextId = 1000;
    Object.values(communitiesData).forEach(sc => {
        sc.forEach(com => {
            com.files.forEach(f => { if (f.id >= nextId) nextId = f.id + 1; });
        });
    });

    let addedCount = 0;
    urls.forEach(url => {
        url = url.trim();
        if (!url) return;
        try {
            const urlObj    = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const fileName  = decodeURIComponent(pathParts[pathParts.length - 1]);
            const finalName = customName || fileName;
            const ext       = fileName.split('.').pop().toLowerCase();

            const fileType = detectFileType(fileName);

            community.files.push({
                id:   nextId++,
                name: finalName,
                type: fileType,
                size: '—',
                date: localDateStr(),
                url:  url,
                source: 'link'
            });
            addedCount++;
        } catch (e) {
            console.error('Error processing URL:', url, e);
        }
    });

    textarea.value        = '';
    customNameInput.value = '';
    renderCommunities();

    // Save to Firestore
    await saveToStorage();
    alert(`✅ Added ${addedCount} file(s) to ${community.name}`);
}

// ─── Admin gate ───────────────────────────────────────────────────────────────
// NOTE: client-side only. The password is visible in this file's source, so this
// keeps casual visitors out — it is NOT real security. For that, the Lambda
// would need to require a secret/token. Change ADMIN_PASSWORD to your own value.
const ADMIN_PASSWORD = 'webdept2022';
let _adminUnlocked = false;

function requireAdmin() {
    if (_adminUnlocked) return true;
    const entry = prompt('This action is intended only for the Atlas Senior Living team.\n\nEnter password to manage files:');
    if (entry === null) return false;          // user cancelled
    if (entry === ADMIN_PASSWORD) {
        _adminUnlocked = true;                  // unlocked for this session
        return true;
    }
    alert('Incorrect password.');
    return false;
}

function togglePanel(which) {
    const panels = { quickLinks: 'quickLinksPanel', upload: 'uploadPanel' };
    const btns   = { quickLinks: 'btnQuickLinks',   upload: 'btnUpload'   };

    // Gate opening either admin panel behind a password.
    const target  = document.getElementById(panels[which]);
    const isClosing = target && target.style.maxHeight && target.style.maxHeight !== '0px';
    if (!isClosing && !requireAdmin()) return;

    Object.entries(panels).forEach(([key, panelId]) => {
        const panel = document.getElementById(panelId);
        const btn   = document.getElementById(btns[key]);
        if (key === which) {
            const isOpen = panel.style.maxHeight && panel.style.maxHeight !== '0px';
            if (isOpen) {
                panel.style.maxHeight = '0px';
                btn.style.background  = 'transparent';
                btn.style.border      = '1px solid transparent';
                btn.style.color       = '#525a68';
            } else {
                panel.style.maxHeight = panel.scrollHeight + 600 + 'px';
                btn.style.background  = 'rgba(34,94,100,0.08)';
                btn.style.border      = '1px solid rgba(34,94,100,0.15)';
                btn.style.color       = '#225e64';
                setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
            }
        } else {
            // close the other panel
            panel.style.maxHeight = '0px';
            btn.style.background  = 'transparent';
            btn.style.border      = '1px solid transparent';
            btn.style.color       = '#525a68';
        }
    });
}

function clearLinks() {
    document.getElementById('linksPaste').value   = '';
    document.getElementById('customName').value   = '';
    document.getElementById('communitySelect').value = '';
}

function populateCommunitySelect() {
    const select = document.getElementById('communitySelect');
    Object.entries(communitiesData).forEach(([state, communities]) => {
        communities.forEach(community => {
            const option   = document.createElement('option');
            option.value   = `${state}|${community.id}`;
            option.textContent = `${community.name} (${community.location}, ${state})`;
            select.appendChild(option);
        });
    });
}

function populateUploadCommunitySelect() {
    const select = document.getElementById('uploadCommunitySelect');
    Object.entries(communitiesData).forEach(([state, communities]) => {
        communities.forEach(community => {
            const option   = document.createElement('option');
            option.value   = `${state}|${community.id}`;
            option.textContent = `${community.name} (${community.location}, ${state})`;
            select.appendChild(option);
        });
    });
    select.addEventListener('change', updateUploadBtn);
}


// ─── Upload to S3 via Lambda ──────────────────────────────────────────────────

const LAMBDA_URL = 'https://g62we6c3vmire4fuehoe6fn62i0upweg.lambda-url.us-east-1.on.aws/';
let uploadQueue = []; // { file, name }



function handleDrop(event) {
    event.preventDefault();
    const zone = document.getElementById('dropZone');
    zone.style.background = 'rgba(255,255,255,0.4)';
    zone.style.borderColor = 'rgba(209,213,219,0.6)';
    handleFileSelect(event.dataTransfer.files);
}

function handleFileSelect(files) {
    for (const file of files) {
        if (!uploadQueue.find(f => f.file.name === file.name)) {
            uploadQueue.push({ file, name: file.name });
        }
    }
    renderFileQueue();
    updateUploadBtn();
}

function renderFileQueue() {
    const wrap = document.getElementById('fileQueue');
    const list = document.getElementById('fileQueueList');
    if (uploadQueue.length === 0) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';
    list.innerHTML = '';
    uploadQueue.forEach((item, idx) => {
        const ext  = item.file.name.split('.').pop().toLowerCase();
        const icon = ['doc','docx'].includes(ext) ? '📝' : ['xls','xlsx'].includes(ext) ? '📊' : ['zip','rar'].includes(ext) ? '🗜️' : ['ai','psd'].includes(ext) ? '🎨' : '📄';
        const row  = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(255,255,255,0.6); border-radius:8px; border:1px solid rgba(209,213,219,0.4);';
        row.innerHTML = `
            <span style="font-size:18px;">${icon}</span>
            <input value="${item.name}" onchange="uploadQueue[${idx}].name=this.value"
                style="flex:1; border:none; background:transparent; font-size:13px; color:#374151; outline:none;">
            <span style="font-size:11px; color:#9ca3af;">${(item.file.size/1024/1024).toFixed(1)} MB</span>
            <button onclick="removeFromQueue(${idx})" style="background:none; border:none; cursor:pointer; color:#9ca3af; font-size:16px; line-height:1; padding:0 2px;">&times;</button>
        `;
        list.appendChild(row);
    });
}

function removeFromQueue(idx) {
    uploadQueue.splice(idx, 1);
    renderFileQueue();
    updateUploadBtn();
}

function updateUploadBtn() {
    const btn = document.getElementById('uploadBtn');
    const hasFiles    = uploadQueue.length > 0;
    const hasCommunity= document.getElementById('uploadCommunitySelect').value !== '';
    const ready = hasFiles && hasCommunity;
    btn.style.opacity        = ready ? '1'    : '0.5';
    btn.style.pointerEvents  = ready ? 'auto' : 'none';
}

async function startUpload() {
    const select = document.getElementById('uploadCommunitySelect');
    if (!select.value) { alert('Please select a community'); return; }
    if (uploadQueue.length === 0) { alert('Please add at least one file'); return; }

    const [stateName, communityId] = select.value.split('|');
    const community = communitiesData[stateName].find(c => c.id === parseInt(communityId));
    const communityFolder = community.name.replace(/[^a-zA-Z0-9]/g, '_');

    const progressWrap = document.getElementById('uploadProgressWrap');
    const progressBar  = document.getElementById('uploadProgressBar');
    const progressPct  = document.getElementById('uploadProgressPct');
    const statusText   = document.getElementById('uploadStatusText');
    const uploadBtn    = document.getElementById('uploadBtn');

    progressWrap.style.display = 'block';
    uploadBtn.style.pointerEvents = 'none';
    uploadBtn.style.opacity = '0.5';

    let nextId = 1000;
    Object.values(communitiesData).forEach(sc => {
        sc.forEach(com => { com.files.forEach(f => { if (f.id >= nextId) nextId = f.id + 1; }); });
    });

    const total = uploadQueue.length;
    let done = 0;
    const uploaded = [];

    const errors = [];

    for (const item of uploadQueue) {
        statusText.textContent = `Uploading ${item.name}…`;
        try {
            // 1. Get presigned URL from Lambda
            const res = await fetch(LAMBDA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName:  item.file.name,
                    fileType:  item.file.type || 'application/octet-stream',
                    community: communityFolder
                })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Lambda error ${res.status}: ${errText}`);
            }
            const lambdaData = await res.json();
            const { url, key } = lambdaData;
            if (!url || !key) throw new Error('Lambda did not return url/key: ' + JSON.stringify(lambdaData));

            // 2. Upload directly to S3
            const s3res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': item.file.type || 'application/octet-stream' },
                body: item.file
            });
            if (!s3res.ok) {
                const s3Err = await s3res.text();
                throw new Error(`S3 error ${s3res.status}: ${s3Err}`);
            }

            const ext = item.file.name.split('.').pop().toLowerCase();
            const fileType = detectFileType(item.file.name);

            const fileUrl = `https://atlasprint.s3.us-east-1.amazonaws.com/${key}`;
            uploaded.push({
                id:   nextId++,
                name: item.name,
                type: fileType,
                size: (item.file.size / 1024 / 1024).toFixed(1) + ' MB',
                date: localDateStr(),
                url:  fileUrl,
                source: 'upload'
            });

        } catch (e) {
            console.error('Upload failed for', item.name, e);
            errors.push(`${item.name}: ${e.message}`);
        }
        done++;
        const pct = Math.round((done / total) * 100);
        progressBar.style.width = pct + '%';
        progressPct.textContent = pct + '%';
    }

    // Only save to Firestore if at least one file uploaded successfully
    if (uploaded.length > 0) {
        uploaded.forEach(f => community.files.push(f));
        await saveToStorage();
        renderCommunities();
    }

    if (errors.length > 0) {
        progressBar.style.background = 'linear-gradient(90deg,#dc2626,#ef4444)';
        statusText.textContent = `❌ ${errors.length} file(s) failed — check console for details`;
        console.error('Upload errors:', errors);
        alert('Some files failed to upload:\n\n' + errors.join('\n'));
    } else {
        progressBar.style.background = 'linear-gradient(90deg,#16a34a,#22c55e)';
        statusText.textContent = `✅ ${uploaded.length} file(s) uploaded to ${community.name}`;
    }

    uploadQueue = [];
    renderFileQueue();

    setTimeout(() => {
        progressWrap.style.display = 'none';
        progressBar.style.width = '0%';
        progressBar.style.background = 'linear-gradient(90deg,#225e64,#2a7580)';
        progressPct.textContent = '0%';
        uploadBtn.style.opacity = '0.5';
        uploadBtn.style.pointerEvents = 'none';
    }, 3000);
}

function clearUpload() {
    uploadQueue = [];
    renderFileQueue();
    updateUploadBtn();
    document.getElementById('fileInput').value = '';
    document.getElementById('uploadProgressWrap').style.display = 'none';
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 400);
}

// Runs once on page load — checks all files across all communities against S3
// Uses a 3s delay so recently-uploaded files are not false-removed
async function syncAllDeletedFiles() {
    let anyChanged = false;

    // Decide whether a single file should be kept. Same rules as before:
    // 200 (or anything else) = keep, 403/404 = removed, network/CORS error = keep.
    async function shouldKeep(file, communityName) {
        if (!file.url) return true; // no url to check
        try {
            const res = await fetch(file.url, { method: 'HEAD', cache: 'no-store' });
            // S3 returns 404 when ListBucket is allowed, but 403 (Access Denied)
            // for missing objects when it isn't — both mean the file is gone.
            if (res.status === 404 || res.status === 403) {
                console.log(`Removed (${res.status}): ${file.name} from ${communityName}`);
                return false;
            }
            return true; // 200 or anything else = keep
        } catch (e) {
            return true; // network/CORS error = keep (can't be sure)
        }
    }

    // Run a list of async tasks with a concurrency cap so we don't fire
    // hundreds of requests at once on large repos.
    async function runWithLimit(tasks, limit) {
        const results = new Array(tasks.length);
        let next = 0;
        async function worker() {
            while (next < tasks.length) {
                const i = next++;
                results[i] = await tasks[i]();
            }
        }
        await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
        return results;
    }

    // Flatten every file into one checklist so all HEAD requests can run
    // in parallel (each file is independent of the others).
    const checks = [];
    for (const communities of Object.values(communitiesData)) {
        for (const community of communities) {
            for (const file of community.files) {
                checks.push({ community, file });
            }
        }
    }
    if (checks.length === 0) return;

    const keepFlags = await runWithLimit(
        checks.map(({ community, file }) => () => shouldKeep(file, community.name)),
        20
    );

    // Rebuild each community's file list from the results.
    const keptByCommunity = new Map();
    checks.forEach(({ community, file }, i) => {
        if (!keptByCommunity.has(community)) keptByCommunity.set(community, []);
        if (keepFlags[i]) keptByCommunity.get(community).push(file);
        else anyChanged = true;
    });
    for (const [community, kept] of keptByCommunity) {
        community.files = kept;
    }

    if (anyChanged) {
        await saveToStorage();
        renderCommunities();
        console.log('✅ Synced deleted files from S3');
    }
}

async function init() {
    // Wait for Firebase with a 5-second timeout fallback
    await new Promise(resolve => {
        if (window._db) { resolve(); return; }
        const timeout  = setTimeout(() => { console.warn("Firebase timeout"); resolve(); }, 5000);
        const interval = setInterval(() => {
            if (window._db) { clearInterval(interval); clearTimeout(timeout); resolve(); }
        }, 50);
        window.addEventListener('firebase-ready', () => {
            clearInterval(interval); clearTimeout(timeout); resolve();
        }, { once: true });
    });

    if (window._db) {
        await loadFromStorage();
    } else {
        console.error("Firebase unavailable — check Firestore is enabled in Firebase console.");
    }
    hideLoadingOverlay();

    const modal = document.getElementById('fileModal');
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    populateCommunitySelect();
    populateUploadCommunitySelect();
    updateViewToggle();
    renderCommunities();
    document.getElementById('searchInput').addEventListener('input', searchCommunities);

    // Sync deleted files 3 seconds after load
    // (delay avoids false-removing recently uploaded files)
    // Safe now that S3 objects are public: existing files return 200,
    // deleted files return 403/404 (anonymous GET on a missing key).
    setTimeout(syncAllDeletedFiles, 3000);
}

document.addEventListener('DOMContentLoaded', init);