// Communities organized by state
const communitiesData = {
    Georgia: [
        { id: 5,  name: "Madison Heights Evans",         location: "Evans",       files: [] },
        { id: 6,  name: "Legacy at Savannah Quarters",  location: "Pooler",      files: [] },
        { id: 7,  name: "Legacy Ridge at Alpharetta",   location: "Alpharetta",  files: [] },
        { id: 8,  name: "Legacy Ridge at Buckhead",     location: "Atlanta",     files: [] },
        { id: 9,  name: "Legacy Ridge at Marietta",     location: "Marietta",    files: [] },
        { id: 10, name: "The Canopy at Westridge",      location: "McDonough",   files: [] },
        { id: 11, name: "The Overlook at Suwanee",      location: "Suwanee",     files: [] }
    ],
    Florida: [
        { id: 15, name: "Madison at Clermont",           location: "Clermont",      files: [] },
        { id: 16, name: "Madison at Ocoee",              location: "Ocoee",         files: [] },
        { id: 17, name: "Madison at Oviedo",             location: "Oviedo",        files: [] },
        { id: 18, name: "The Goldton at Venice",         location: "Venice",        files: [] },
        { id: 19, name: "The Goldton at St. Petersburg", location: "St. Petersburg",files: [] },
        { id: 20, name: "Lake Howard Heights",           location: "Winter Haven",  files: [] },
        { id: 21, name: "The Canopy At Beacon Woods",   location: "Winter Park",   files: []},
        { id: 22, name: "The Goldton At Lake Nona",     location: "Lake Nona",     files: [] },
        { id: 100, name: "The Goldton At Stuart", location: "Stuart", files: [] }
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
    ],
    Alabama: [
        { id: 12, name: "Kelley Place",                  location: "Enterprise",    files: [] },
        { id: 1,  name: "Madison Heights Enterprise",    location: "Enterprise",  files: [] },
        { id: 13, name: "Monark Grove Madison",          location: "Madison",       files: [] },
        { id: 14, name: "Monark Grove Greystone",        location: "Greystone",     files: [] },
        { id: 36, name: "Legacy Ridge at Trussville",    location: "Trussville",  files: [] },
        { id: 2,  name: "Madison at The Range",          location: "Madison",     files: [] },
        { id: 3,  name: "The Goldton at Athens",         location: "Athens",      files: [] },
        { id: 4,  name: "The Goldton at Jones Farm",     location: "Atlanta",     files: [] }
    ],
    Corporate: [
        { id: 99, name: "Corporate & All Communities", location: "Birmingham", files: [] }
    ]
};

// ─── Firestore helpers ────────────────────────────────────────────────────────

const FIRESTORE_DOC = "repository/files";

async function saveToStorage() {
    const db  = window._db;
    const ref = window._firestoreDoc(db, "repository", "files");

    const snapshot = {};
    Object.entries(communitiesData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([state, communities]) => {
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

    Object.entries(communitiesData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([state, communities]) => {
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

    renderRecent();
}

// ─── Recently uploaded ─────────────────────────────────────────────────────────

const RECENT_COLLAPSED = 5;
let _recentExpanded = false;

function getRecentFiles() {
    const all = [];
    Object.values(communitiesData).forEach(communities => {
        communities.forEach(community => {
            (community.files || []).forEach(file => {
                if (!file.url) return; // skip placeholders/sample entries
                all.push({ file, community });
            });
        });
    });
    // Most recent first: by date, then by id (ids increase with every add).
    all.sort((a, b) => {
        const d = String(b.file.date || '').localeCompare(String(a.file.date || ''));
        if (d !== 0) return d;
        return (b.file.id || 0) - (a.file.id || 0);
    });
    // "Recent" = files uploaded within the last 7 days.
    return all.filter(x => {
        const [y, m, d] = String(x.file.date || '').split('-').map(Number);
        if (!y || !m || !d) return false;
        const diffDays = (Date.now() - new Date(y, m - 1, d).getTime()) / 86400000;
        return diffDays >= -2 && diffDays <= 7; // -2 tolerates timezone offsets
    });
}

function toggleRecent(expand) {
    _recentExpanded = expand;
    renderRecent();
}

function renderRecent() {
    const section = document.getElementById('recentSection');
    if (!section) return;

    // Hide while searching, so it doesn't compete with results.
    if (searchQuery && searchQuery.trim() !== '') { section.style.display = 'none'; return; }

    const all = getRecentFiles();
    if (all.length === 0) { section.style.display = 'none'; return; }

    const recent = _recentExpanded ? all : all.slice(0, RECENT_COLLAPSED);
    const hiddenCount = all.length - recent.length;

    const cards = recent.map(({ file, community }) => {
        const fType = effectiveType(file);
        let icon = '📄';
        if (fType === 'word')    icon = '📝';
        if (fType === 'excel')   icon = '📊';
        if (fType === 'image')   icon = '🖼️';
        if (fType === 'archive') icon = '🗜️';

        const badge = isS3File(file)
            ? '<img src="s3.jpeg" class="s3-badge" alt="S3" title="Hosted on AWS S3">'
            : (isDropboxFile(file) ? '<img src="dropbox-logo.jpeg" class="s3-badge" alt="Dropbox" title="Dropbox link">' : '');

        return `
            <div class="recent-card" onclick="openFileInModal(${community.id}, ${file.id})"
                 onmouseenter="showFilePreview(${file.id}, this)" onmouseleave="hideFilePreview()">
                <div class="recent-card-top">
                    <span style="font-size:22px;">${icon}</span>
                    ${badge}
                    ${isNewFile(file) ? '<span class="new-badge">New</span>' : ''}
                </div>
                <div class="recent-name" title="${file.name}">${file.name}</div>
                <div class="recent-meta">${community.name}</div>
                <div class="recent-meta">${formatDate(file.date)}</div>
                <div style="display:flex;gap:8px;margin-top:12px;align-items:stretch;">
                    <button class="download-btn" style="flex:1;height:40px;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:12px;" onclick="event.stopPropagation(); downloadFile(${file.id})">Download</button>
                    <button class="rename-btn" title="Copy link" aria-label="Copy link" style="width:42px;margin-top:12px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:10px;" onclick="event.stopPropagation(); copyFileLink(${file.id})">
                        <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </button>
                </div>
            </div>`;
    }).join('');

    // Trailing card: "+N more" to expand, or "Show less" to collapse.
    let moreCard = '';
    if (!_recentExpanded && hiddenCount > 0) {
        moreCard = `
            <div class="recent-card recent-more" onclick="toggleRecent(true)">
                <span class="recent-more-num">+${hiddenCount}</span>
                <span class="recent-more-label">more file${hiddenCount === 1 ? '' : 's'}</span>
                <span class="recent-more-cta">Show all</span>
            </div>`;
    } else if (_recentExpanded && all.length > RECENT_COLLAPSED) {
        moreCard = `
            <div class="recent-card recent-more" onclick="toggleRecent(false)">
                <svg style="width:22px;height:22px;margin-bottom:4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                <span class="recent-more-cta">Show less</span>
            </div>`;
    }

    section.innerHTML = `
        <div class="recent-header">
            <svg style="width:15px;height:15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Recently uploaded ${all.length > RECENT_COLLAPSED ? `<span style="color:#9ca3af;font-weight:400;">(${all.length})</span>` : ''}
        </div>
        <div class="recent-row">${cards}${moreCard}</div>`;
    section.style.display = 'block';
}

function openFileInModal(communityId, fileId) {
    let target = null;
    Object.values(communitiesData).forEach(communities => {
        communities.forEach(c => { if (c.id === communityId) target = c; });
    });
    if (!target) return;
    openModal(target);
    const file = target.files.find(f => f.id === fileId);
    if (file && file.path) {
        _modalPath = file.path;
        renderModalFiles();
    }
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

function lastAddedDate(community) {
    let latest = '';
    (community.files || []).forEach(f => {
        if (f.date && String(f.date) > latest) latest = String(f.date);
    });
    return latest || null;
}

function createFolderRow(community) {
    const row = document.createElement('div');
    row.className = 'folder-row rounded-xl px-5 py-3 flex items-center gap-4 cursor-pointer';
    row.onclick = () => openModal(community);

    const count   = community.files.length;
    const latest  = lastAddedDate(community);

    row.innerHTML = `
        <span class="text-xs text-gray-500 font-light flex-shrink-0 w-16 text-left">
            ${count} ${count === 1 ? 'file' : 'files'}
        </span>
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
        <span class="text-xs text-gray-400 font-light flex-shrink-0 text-right" style="min-width:150px;">
            ${latest ? 'Last added: ' + formatDate(latest) : '—'}
        </span>
    `;
    return row;
}

// Keep track of which community is open in the modal
let _modalCommunity = null;

function openModal(community) {
    _modalCommunity = community;
    _modalPath = '';
    const modal         = document.getElementById('fileModal');
    const modalTitle    = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');

    modalTitle.textContent = community.name;
    modalLocation.querySelector('span').textContent = community.location;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderModalFiles();
}

// Current folder path inside the open community modal ('' = root).
let _modalPath = '';
let _modalNavDir = 'in'; // 'in' = going deeper, 'out' = going up

function navigateModal(path) {
    const oldDepth = _modalPath ? _modalPath.split('/').length : 0;
    const newDepth = path ? path.split('/').length : 0;
    _modalNavDir = newDepth >= oldDepth ? 'in' : 'out';
    _modalPath = path || '';
    renderModalFiles();
}

function renderModalFiles() {
    const community      = _modalCommunity;
    const modalFilesList = document.getElementById('modalFilesList');
    modalFilesList.innerHTML = '';

    const files = community.files || [];

    if (files.length === 0) {
        modalFilesList.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 font-light">No files added yet for this community.</p>
            </div>`;
        return;
    }

    const cur = _modalPath || '';

    // Separate immediate subfolders from files that live at the current path.
    const folders   = {};   // folder name -> item count
    const filesHere = [];
    files.forEach(f => {
        const p = f.path || '';
        if (p === cur) { filesHere.push(f); return; }
        const prefix = cur ? cur + '/' : '';
        if ((p + '/').startsWith(prefix)) {
            const rem = cur ? p.slice(prefix.length) : p;
            const seg = rem.split('/')[0];
            if (seg) folders[seg] = (folders[seg] || 0) + 1;
        }
    });

    // Breadcrumb when inside a folder.
    if (cur) {
        const crumb = document.createElement('div');
        crumb.className = 'modal-breadcrumb';
        const parts = cur.split('/');
        let acc = '';
        let html = `<button onclick="navigateModal('')">Root</button>`;
        parts.forEach((seg, i) => {
            acc = acc ? acc + '/' + seg : seg;
            html += `<span class="sep">/</span>`;
            html += (i === parts.length - 1)
                ? `<span class="cur">${seg}</span>`
                : `<button onclick="navigateModal('${acc.replace(/'/g, "\\'")}')">${seg}</button>`;
        });
        crumb.innerHTML = html;
        modalFilesList.appendChild(crumb);
    }

    // Folder rows (navigable).
    Object.keys(folders).sort((a, b) => a.localeCompare(b)).forEach(name => {
        const target = cur ? cur + '/' + name : name;
        const row = document.createElement('div');
        row.className = 'file-item flex justify-between items-center p-5 rounded-xl';
        row.style.cursor = 'pointer';
        row.onclick = () => navigateModal(target);
        row.innerHTML = `
            <div class="flex-1">
                <p class="font-normal text-gray-700 flex items-center gap-3">
                    <span class="text-2xl">📁</span>
                    <span>${name}</span>
                </p>
                <p class="text-xs text-gray-400 font-light tracking-wide">${folders[name]} ${folders[name] === 1 ? 'item' : 'items'}</p>
            </div>
            <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        `;
        modalFilesList.appendChild(row);
    });

    // File rows at this level.
    filesHere.forEach(file => modalFilesList.appendChild(buildFileRow(file)));

    if (Object.keys(folders).length === 0 && filesHere.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-center py-12';
        empty.innerHTML = `<p class="text-gray-400 font-light">This folder is empty.</p>`;
        modalFilesList.appendChild(empty);
    }

    // Smooth directional transition between folder levels, with a gentle
    // staggered cascade on the rows so each level feels satisfying to enter.
    modalFilesList.classList.remove('slide-in', 'slide-out');
    Array.from(modalFilesList.querySelectorAll('.file-item')).forEach((el, i) => {
        el.style.animationDelay = (i * 0.09) + 's';
        el.classList.add('row-enter');
    });
    void modalFilesList.offsetWidth; // restart the animation
    modalFilesList.classList.add(_modalNavDir === 'out' ? 'slide-out' : 'slide-in');

    // Render PDF thumbnails for the files currently shown.
    filesHere.forEach(file => { if (canThumbnail(file)) renderPdfThumb(file); });
}

function buildFileRow(file) {
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
    const copyBtn = `
                <button
                        onclick="event.stopPropagation(); copyFileLink(${file.id})"
                        title="Copy link" aria-label="Copy link"
                        class="rename-btn ml-3 flex items-center justify-center rounded-xl transition-all"
                        style="width:44px;height:44px;flex-shrink:0;">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>`;
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
                    ${isS3File(file) ? '<img src="s3.jpeg" class="s3-badge" alt="Hosted on S3" title="Hosted on AWS S3">' : ''}
                    ${isDropboxFile(file) ? '<img src="dropbox-logo.jpeg" class="s3-badge" alt="Dropbox link" title="Dropbox link">' : ''}
                    ${isNewFile(file) ? '<span class="new-badge">New</span>' : ''}
                </p>
                <p class="text-xs text-gray-400 font-light tracking-wide">${typeLabel(file)} • ${file.size} • ${formatDate(file.date)}</p>
            </div>
            <div class="file-actions flex items-center ml-6">
                <button
                        onclick="event.stopPropagation(); downloadFile(${file.id})"
                        class="download-btn text-gray-700 font-light py-3 px-6 rounded-xl transition-all whitespace-nowrap text-sm tracking-wide"
                    >
                        Download
                    </button>
                ${copyBtn}
                ${renameBtn}
                ${deleteBtn}
            </div>
        `;
    return fileRow;
}

// Thumbnails only work for PDFs served with permissive CORS — i.e. our own S3
// bucket. External links (Dropbox, etc.) block cross-origin fetch, so we keep
// the icon for them instead of failing with CORS errors in the console.
// True when the file lives in our own S3 bucket.
function isS3File(file) {
    return !!file.url && /amazonaws\.com/.test(file.url);
}

// True when the file is a Dropbox link.
function isDropboxFile(file) {
    return !!file.url && /dropbox\.com|dropboxusercontent\.com/.test(file.url);
}

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

// ─── Hover preview (PDF first page / images) ───────────────────────────────────

let _previewEl = null;
let _previewToken = null;
const _previewCache = {};

function findFileById(id) {
    let found = null;
    Object.values(communitiesData).forEach(coms =>
        coms.forEach(c => { const f = (c.files || []).find(f => f.id === id); if (f) found = f; }));
    return found;
}

function ensurePreviewEl() {
    if (_previewEl) return _previewEl;
    const el = document.createElement('div');
    el.id = 'hoverPreview';
    el.style.cssText = 'position:fixed;z-index:3000;pointer-events:none;opacity:0;transition:opacity 0.15s ease;background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:12px;box-shadow:0 16px 48px rgba(31,38,135,0.22);padding:8px;';
    document.body.appendChild(el);
    _previewEl = el;
    return el;
}

function positionPreview(el, anchor) {
    const r  = anchor.getBoundingClientRect();
    const pw = el.offsetWidth  || 256;
    const ph = el.offsetHeight || 256;
    let top  = r.top - ph - 10;
    if (top < 10) top = r.bottom + 10;                  // flip below if no room above
    let left = r.left + r.width / 2 - pw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - pw - 10));
    el.style.top  = top + 'px';
    el.style.left = left + 'px';
}

async function showFilePreview(fileId, anchor) {
    const file = findFileById(fileId);
    if (!file || !file.url) return;

    const t     = effectiveType(file);
    const isImg = t === 'image';
    const isPdf = t === 'pdf' && /amazonaws\.com/.test(file.url);
    if (!isImg && !isPdf) return; // only images and (S3) PDFs preview

    const el = ensurePreviewEl();
    _previewToken = fileId;
    el.innerHTML = '<div style="font-size:12px;color:#9ca3af;padding:24px 28px;text-align:center;">Loading preview…</div>';
    el.style.opacity = '1';
    positionPreview(el, anchor);

    if (isImg) {
        el.innerHTML = `<img src="${file.url}" style="display:block;max-width:240px;max-height:300px;border-radius:6px;"
            onload="if(window._repositionPreview)_repositionPreview()"
            onerror="hideFilePreview()">`;
        window._repositionPreview = () => positionPreview(el, anchor);
        return;
    }

    // PDF: render first page (cached).
    if (_previewCache[file.url]) {
        if (_previewToken !== fileId) return;
        el.innerHTML = `<img src="${_previewCache[file.url]}" style="display:block;max-width:240px;border-radius:6px;">`;
        positionPreview(el, anchor);
        return;
    }
    try {
        const lib = window.pdfjsLib;
        if (!lib) return;
        lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const resp = await fetch(file.url, { cache: 'force-cache' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.arrayBuffer();
        const pdf  = await lib.getDocument({ data }).promise;
        const page = await pdf.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const vp   = page.getViewport({ scale: 240 / base.width });
        const canvas = document.createElement('canvas');
        canvas.width  = vp.width;
        canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        _previewCache[file.url] = dataUrl;
        if (_previewToken !== fileId) return;            // pointer moved away
        el.innerHTML = `<img src="${dataUrl}" style="display:block;max-width:240px;border-radius:6px;">`;
        positionPreview(el, anchor);
    } catch (e) {
        hideFilePreview();
    }
}

function hideFilePreview() {
    _previewToken = null;
    if (_previewEl) _previewEl.style.opacity = '0';
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

function copyFileLink(fileId) {
    const file = findFileById(fileId);
    if (!file || !file.url) { showToast('No link available'); return; }

    const done = () => showToast('Link copied');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(file.url).then(done).catch(() => fallbackCopy(file.url, done));
    } else {
        fallbackCopy(file.url, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { showToast('Could not copy'); }
    document.body.removeChild(ta);
}

let _toastTimer = null;
function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(12px);z-index:4000;background:#225e64;color:#fff;font-size:13px;font-weight:500;padding:11px 20px;border-radius:12px;box-shadow:0 8px 28px rgba(34,94,100,0.3);opacity:0;transition:opacity 0.2s ease, transform 0.2s ease;pointer-events:none;display:flex;align-items:center;gap:8px;';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<svg style="width:15px;height:15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7"/></svg>${message}`;
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(12px)';
    }, 1800);
}

async function renameFile(fileId) {
    if (!(await requireAdmin())) return;

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
    if (!(await requireAdmin())) return;

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

// Promise-based password gate using an in-app modal (matches the app's UI).
let _pwResolver = null;

function requireAdmin() {
    if (_adminUnlocked) return Promise.resolve(true);
    return new Promise(resolve => {
        _pwResolver = resolve;
        const modal = document.getElementById('pwModal');
        const input = document.getElementById('pwInput');
        const err   = document.getElementById('pwError');
        input.value = '';
        err.style.display = 'none';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => input.focus(), 60);
    });
}

function submitPassword() {
    const input = document.getElementById('pwInput');
    const err   = document.getElementById('pwError');
    if (input.value === ADMIN_PASSWORD) {
        _adminUnlocked = true;
        finishPassword(true);
    } else {
        err.style.display = 'block';
        input.select();
    }
}

function closePasswordModal() {
    finishPassword(false);
}

function finishPassword(result) {
    const modal = document.getElementById('pwModal');
    modal.classList.remove('active');
    const fileModal = document.getElementById('fileModal');
    document.body.style.overflow = (fileModal && fileModal.classList.contains('active')) ? 'hidden' : 'auto';
    const resolve = _pwResolver;
    _pwResolver = null;
    if (resolve) resolve(result);
}

function handlePwKey(e) {
    if (e.key === 'Enter')  { e.preventDefault(); submitPassword(); }
    if (e.key === 'Escape') { e.preventDefault(); closePasswordModal(); }
}

async function togglePanel(which) {
    const panels = { quickLinks: 'quickLinksPanel', upload: 'uploadPanel' };
    const btns   = { quickLinks: 'btnQuickLinks',   upload: 'btnUpload'   };

    // Gate opening either admin panel behind a password.
    const target  = document.getElementById(panels[which]);
    const isClosing = target && target.style.maxHeight && target.style.maxHeight !== '0px';
    if (!isClosing && !(await requireAdmin())) return;

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
    Object.entries(communitiesData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([state, communities]) => {
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
    Object.entries(communitiesData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([state, communities]) => {
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
        // webkitRelativePath is set when a folder is selected — it carries the
        // file's path inside the chosen folder (e.g. "Folder/Sub/file.pdf").
        const relPath = file.webkitRelativePath || file.name;
        if (!uploadQueue.find(f => f.relPath === relPath)) {
            uploadQueue.push({ file, name: file.name, relPath });
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
        const icon = ['doc','docx'].includes(ext) ? '📝' : ['xls','xlsx'].includes(ext) ? '📊' : ['zip','rar'].includes(ext) ? '🗜️' : ['ai','psd','indd','idml','eps'].includes(ext) ? '🎨' : '📄';
        const isFolderItem = item.relPath.includes('/');
        const row  = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(255,255,255,0.6); border-radius:8px; border:1px solid rgba(209,213,219,0.4);';
        // Folder items show their relative path (read-only); loose files stay editable.
        const nameField = isFolderItem
            ? `<span style="flex:1; font-size:13px; color:#374151; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.relPath}">${item.relPath}</span>`
            : `<input value="${item.name}" onchange="uploadQueue[${idx}].name=this.value" style="flex:1; border:none; background:transparent; font-size:13px; color:#374151; outline:none;">`;
        row.innerHTML = `
            <span style="font-size:18px;">${icon}</span>
            ${nameField}
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
                    // Send the relative path so the folder structure is recreated
                    // as key prefixes in S3 (e.g. "Folder/Sub/file.pdf").
                    fileName:  item.relPath,
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

            const fileType = detectFileType(item.file.name);
            // Folder path for the in-app tree = the relative path minus the
            // filename (e.g. "Folder/Sub"). Loose files have no path (root).
            const dirPath = item.relPath.includes('/')
                ? item.relPath.slice(0, item.relPath.lastIndexOf('/'))
                : '';

            const fileUrl = `https://atlasprint.s3.us-east-1.amazonaws.com/${key}`;
            uploaded.push({
                id:   nextId++,
                name: item.name,
                type: fileType,
                size: (item.file.size / 1024 / 1024).toFixed(1) + ' MB',
                date: localDateStr(),
                url:  fileUrl,
                source: 'upload',
                path: dirPath
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
    document.getElementById('folderInput').value = '';
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

    // Solo verificar archivos de S3 — Dropbox y otros externos siempre se conservan
    const isS3 = /amazonaws\.com/.test(file.url);
    if (!isS3) return true;

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