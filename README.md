# Senior Living Communities Repository

A modern web application to manage and organize documents for senior living communities across multiple states.

## ✨ Features

✅ **Community Management** - Organized by state with collapsible community cards
✅ **File Repository** - Each community has its own document collection
✅ **Real-time Search** - Search by community name, location, or document name
✅ **Statistics Dashboard** - Track total communities, files, and states
✅ **Responsive Design** - Works perfectly on mobile, tablet, and desktop
✅ **Modern Interface** - Built with Tailwind CSS for a professional look
✅ **File Downloads** - Quick download buttons for each document
✅ **Smart Highlighting** - Search results are highlighted for easy identification

## 🚀 Quick Start

### Requirements
- Modern web browser
- Internet connection (for Tailwind CSS CDN)

### Installation

1. **Option 1: Open in Browser**
   - Simply open `index.html` in your web browser

2. **Option 2: Use Live Server (VS Code)**
   - Install "Live Server" extension
   - Right-click on `index.html` → "Open with Live Server"

### Project Structure

```
CityPaperRepository/
├── index.html      # Main HTML structure
├── script.js       # JavaScript logic and data
├── README.md       # This file
└── AGENTS.MD       # Configuration file
```

## 🗺️ Communities by State

### Georgia (11 communities)
- Madison Heights Enterprise, Enterprise
- Madison at The Range, Madison
- The Goldton at Athens, Athens
- The Goldton at Jones Farm, Atlanta
- Madison Heights Evans, Evans
- Legacy at Savannah Quarters, Pooler
- Legacy Ridge at Alpharetta, Alpharetta
- Legacy Ridge at Buckhead, Atlanta
- Legacy Ridge at Marietta, Marietta
- The Canopy at Westridge, McDonough
- The Overlook at Suwanee, Suwanee

### Florida (11 communities)
- Kelley Place, Enterprise
- Monark Grove Madison, Madison
- Monark Grove Greystone, Greystone
- Madison at Clermont, Clermont
- Madison at Ocoee, Ocoee
- Madison at Oviedo, Oviedo
- The Goldton at Venice, Venice
- The Goldton at St. Petersburg, St. Petersburg
- Lake Howard Heights, Winter Haven
- The Canopy At Beacon Woods, Winter Park
- The Goldton At Lake Nona, Lake Nona

### Mississippi (2 communities)
- The Goldton at Southaven, Southaven
- The Goldton at Adelaide, Starkville

### South Carolina (4 communities)
- Oakview Park, Greenville
- Spring Park, Travelers Rest
- Legacy Reserve Fairview Park, Simpsonville
- Wildcat Senior Living, Summerville

### Tennessee (1 community)
- The Goldton at Spring Hill, Spring Hill

### Texas (2 communities)
- The Oscar at Georgetown, Georgetown
- The Oscar at Veramendi, San Antonio

### Maryland (2 communities)
- Tribute at Black Hill, Black Hill
- Tribute at Melford, Melford

### Virginia (2 communities)
- Tribute at One Loudoun, Loudoun
- Tribute at The Glen, Glen

**Total: 35 communities across 8 states**

## 🎨 Customization

### Add a New Community
Edit `script.js` in the `communitiesData` object:

```javascript
{
    id: 36,
    name: "Community Name",
    location: "City Name",
    files: [
        { id: 200, name: "Document Name", type: "pdf", size: "1.5 MB", date: "2024-01-15" }
    ]
}
```

### Add Files to a Community
Find the community in the data and add to its `files` array:

```javascript
{ id: 142, name: "File Name", type: "pdf", size: "2.0 MB", date: "2024-03-15" }
```

Supported file types: `pdf`, `word`, `excel`

### Customize Colors
Edit the Tailwind CSS classes in `index.html`:
- `bg-blue-600` → Change to `bg-green-600`, `bg-red-600`, etc.
- `from-blue-600` → Change gradient colors as needed

## 🔧 Core Features

### Search Functionality
- Real-time search across all communities
- Searches community names, locations, and file names
- Case-insensitive matching
- Highlights matching files in results

### Community Cards
- Click to expand/collapse and view files
- Shows file count for each community
- Displays location information
- Responsive layout

### Statistics Panel
- Total communities count
- Total files across all communities
- Number of states represented
- Currently viewing count (based on search)

### Download Simulation
- Click "Download" button on any file
- Currently shows alert with file name
- Can be integrated with a real backend for actual downloads

## 📊 Dashboard Statistics

The page automatically updates statistics for:
- **Total Communities**: All communities in the system
- **Total Files**: All documents across all communities
- **States**: Number of states represented
- **Viewing**: Communities matching current search

## 🌐 Technologies Used

- **HTML5** - Semantic structure
- **JavaScript (Vanilla)** - No external dependencies
- **Tailwind CSS** - Utility-first CSS framework
- **CDN** - Tailwind CSS served from CDN (no build process needed)

## 💡 Tips & Tricks

- Files are currently simulated
- To enable real downloads, integrate with a backend service
- Use localStorage to save user preferences
- Consider adding document categories or tags for better organization
- Add export functionality for reports
- Implement user authentication for access control

## 📝 License

Free to use for Senior Living Communities organization and management.

---

**Need customization?** Modify the data in `script.js` to match your specific communities and documents.
# CityPaperRepository
