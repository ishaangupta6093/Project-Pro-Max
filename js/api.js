// =========================================
// ProofPlate — API Integration Helper
// =========================================

const API_BASE_URL = 'http://localhost:3000/api';

async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Fetch failed:", error);
        showToast("Backend connection failed. Using offline mode.", "error");
        return null;
    }
}

// Global variable to store fetched restaurants for local filtering/sorting
let API_RESTAURANTS = [];

async function loadRestaurantsFromBackend() {
    const data = await apiFetch('/restaurants');
    if (data) {
        // Map backend fields to frontend fields
        API_RESTAURANTS = data.map(r => ({
            id: r.id,
            name: r.name,
            cuisine: r.cuisine || "Indian", // fallback
            score: r.hygieneScore,
            status: r.category, // Matches server 'category'
            complaints: r.complaintsCount,
            positiveVotes: r.votes ? r.votes.clean : 0, 
            negativeVotes: r.votes ? r.votes.unclean : 0,
            image: (r.latestPhoto && r.latestPhoto.imageUrl) ? r.latestPhoto.imageUrl : 'assets/kitchen_clean.png',
            proofImage: (r.latestPhoto && r.latestPhoto.imageUrl) ? r.latestPhoto.imageUrl : 'assets/kitchen_clean.png',
            lastVerified: 2, 
            address: r.location,
            rating: 4.5
        }));
        return API_RESTAURANTS;
    }
    return null;
}
