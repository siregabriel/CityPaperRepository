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
        { id: 21, name: "The Canopy At Beacon Woods",   location: "Winter Park",   files: [
            { id: 163, name: "Fitness Programs",    type: "word",  size: "1.5 MB", date: "2024-03-05" },
            { id: 164, name: "Class Schedule",      type: "pdf",   size: "1.2 MB", date: "2024-03-10" },
            { id: 165, name: "Member Registration", type: "excel", size: "1.6 MB", date: "2024-03-15" }
        ]},
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
                    live.files = savedCom.files;
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
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12';

        filtered.forEach(community => {
            grid.appendChild(createFolderCard(community));
        });

        stateSection.appendChild(grid);
        container.appendChild(stateSection);
    });

    emptyState.classList.toggle('hidden', hasResults);
}

function createFolderCard(community) {
    const card = document.createElement('div');
    card.className = 'folder-card rounded-2xl p-6';
    card.onclick = () => openModal(community);

    card.innerHTML = `
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

function openModal(community) {
    const modal         = document.getElementById('fileModal');
    const modalTitle    = document.getElementById('modalTitle');
    const modalLocation = document.getElementById('modalLocation');
    const modalFilesList= document.getElementById('modalFilesList');

    modalTitle.textContent = community.name;
    modalLocation.querySelector('span').textContent = community.location;
    modalFilesList.innerHTML = '';

    if (community.files.length === 0) {
        modalFilesList.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-400 font-light">No files added yet for this community.</p>
            </div>`;
    } else {
        community.files.forEach(file => {
            const fileRow = document.createElement('div');
            fileRow.className = 'file-item flex justify-between items-center p-5 rounded-xl';

            let typeIcon = '📄';
            if (file.type === 'word')  typeIcon = '📝';
            if (file.type === 'excel') typeIcon = '📊';

            fileRow.innerHTML = `
                <div class="flex-1">
                    <p class="font-normal text-gray-700 flex items-center gap-3">
                        <span class="text-2xl">${typeIcon}</span>
                        <span>${file.name}</span>
                    </p>
                    <p class="text-xs text-gray-400 mt-2 ml-11 font-light tracking-wide">${file.type.toUpperCase()} • ${file.size} • ${formatDate(file.date)}</p>
                </div>
                <button
                    onclick="event.stopPropagation(); downloadFile(${file.id})"
                    class="download-btn ml-6 text-white font-light py-3 px-6 rounded-xl transition-all whitespace-nowrap text-sm tracking-wide"
                >
                    Download
                </button>
            `;
            modalFilesList.appendChild(fileRow);
        });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

            let fileType = 'pdf';
            if (['doc', 'docx'].includes(ext))          fileType = 'word';
            if (['xls', 'xlsx'].includes(ext))          fileType = 'excel';
            if (['ai', 'psd', 'sketch'].includes(ext))  fileType = 'design';
            if (['zip', 'rar', '7z'].includes(ext))     fileType = 'archive';

            community.files.push({
                id:   nextId++,
                name: finalName,
                type: fileType,
                size: '—',
                date: new Date().toISOString().split('T')[0],
                url:  url
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

function toggleQuickLinks() {
    const body    = document.getElementById('quickLinksBody');
    const chevron = document.getElementById('quickLinksChevron');
    const isOpen  = body.style.maxHeight !== '0px' && body.style.maxHeight !== '';
    if (isOpen) {
        body.style.maxHeight = '0px';
        chevron.style.transform = 'rotate(0deg)';
    } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        chevron.style.transform = 'rotate(180deg)';
        setTimeout(() => { body.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
    }
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

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => overlay.remove(), 400);
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
    renderCommunities();
    document.getElementById('searchInput').addEventListener('input', searchCommunities);
}

document.addEventListener('DOMContentLoaded', init);