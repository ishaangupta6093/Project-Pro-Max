const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ─── SETUP ────────────────────────────────────────────────────────────────────

const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const DB_FILE = path.resolve(__dirname, 'db.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── IN-MEMORY STORE ──────────────────────────────────────────────────────────
// Data Models:
//   Restaurant : { id, name, location }
//   Photo      : { id, restaurantId, imageUrl, timestamp }
//   Complaint  : { id, restaurantId, issue, timestamp }
//   Vote       : { id, restaurantId, vote ("clean"|"unclean"), timestamp }

const DEFAULT_DATA = {
    restaurants: [
        { id: "r1", name: "Biryani Box",         location: "HSR Layout" },
        { id: "r2", name: "Cloud Pizza Co.",      location: "Indiranagar" },
        { id: "r3", name: "Wrap & Roll Kitchen",  location: "Koramangala" },
        { id: "r4", name: "Mama's Tiffin House",  location: "Jayanagar" },
        { id: "r5", name: "Dragon Bowl",          location: "BTM Layout" },
        { id: "r6", name: "The Salad Studio",     location: "Whitefield" }
    ],
    photos: [],
    complaints: [],
    votes: []
};

let db = { ...DEFAULT_DATA };

// Load persisted data if available
if (fs.existsSync(DB_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        console.log('✔ Loaded persisted DB from db.json');
    } catch (e) {
        console.warn('⚠ Could not parse db.json, using defaults.');
    }
}

const saveDB = () => {
    try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
    catch (e) { console.error('DB save error:', e.message); }
};

// ─── HYGIENE SCORE ────────────────────────────────────────────────────────────
/**
 * Calculates a hygiene score for a restaurant.
 *   Base:             100
 *   Per complaint:    -10
 *   Per "unclean" vote: -5
 *   Per "clean" vote:   +2
 *   Clamped to [0, 100]
 *
 * Category:
 *   >= 75  → Safe
 *   >= 50  → Moderate
 *   <  50  → Risky
 */
const calcHygiene = (restaurantId) => {
    const complaints = db.complaints.filter(c => c.restaurantId === restaurantId);
    const votes      = db.votes.filter(v => v.restaurantId === restaurantId);

    const cleanVotes   = votes.filter(v => v.vote === 'clean').length;
    const uncleanVotes = votes.filter(v => v.vote === 'unclean').length;

    let score = 100
        - complaints.length * 10
        - uncleanVotes * 5
        + cleanVotes * 2;

    score = Math.max(0, Math.min(100, score));

    const category = score >= 75 ? 'Safe' : score >= 50 ? 'Moderate' : 'Risky';

    return { score, category };
};

// Helper: get the latest photo for a restaurant
const latestPhoto = (restaurantId) => {
    const photos = db.photos.filter(p => p.restaurantId === restaurantId);
    return photos.length > 0 ? photos[photos.length - 1] : null;
};

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve the frontend (root of the project, one level up)
// Added extensions: ['html'] to support clean URLs like /dashboard instead of /dashboard.html
app.use(express.static(path.resolve(__dirname, '..'), { extensions: ['html'] }));

// ─── MULTER (photo uploads) ───────────────────────────────────────────────────

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
        filename:    (_req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/i;
        allowed.test(path.extname(file.originalname))
            ? cb(null, true)
            : cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// ── Restaurants ──────────────────────────────────────────────────────────────

/**
 * POST /api/restaurants
 * Add a new restaurant.
 * Body: { name: string, location: string }
 */
app.post('/api/restaurants', (req, res) => {
    const { name, location } = req.body || {};
    if (!name || !location) {
        return res.status(400).json({ error: 'name and location are required.' });
    }

    const newRestaurant = {
        id:       'r' + Date.now(),
        name:     name.trim(),
        location: location.trim()
    };

    db.restaurants.push(newRestaurant);
    saveDB();
    res.status(201).json(newRestaurant);
});

/**
 * GET /api
 * Root API endpoint summary.
 */
app.get('/api', (_req, res) => {
    res.json({
        message: "ProofPlate API is live 🍕",
        endpoints: [
            "/api/restaurants",
            "/api/restaurants/:id",
            "/api/restaurants/:id/photos",
            "/api/restaurants/:id/complaints",
            "/api/restaurants/:id/votes"
        ]
    });
});

/**
 * GET /api/restaurants
 * Get all restaurants with hygiene score, latest photo, complaints count, and vote counts.
 */
app.get('/api/restaurants', (_req, res) => {
    const list = db.restaurants.map(r => {
        const { score, category } = calcHygiene(r.id);
        const complaints = db.complaints.filter(c => c.restaurantId === r.id);
        const votes      = db.votes.filter(v => v.restaurantId === r.id);

        return {
            ...r,
            hygieneScore:     score,
            category,
            complaintsCount:  complaints.length,
            votes: {
                clean:   votes.filter(v => v.vote === 'clean').length,
                unclean: votes.filter(v => v.vote === 'unclean').length
            },
            latestPhoto: latestPhoto(r.id)
        };
    });

    res.json(list);
});

/**
 * GET /api/restaurants/:id
 * Get details for a single restaurant (score, category, latest image, complaints, votes).
 */
app.get('/api/restaurants/:id', (req, res) => {
    const restaurant = db.restaurants.find(r => r.id === req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    const { score, category } = calcHygiene(restaurant.id);
    const complaints = db.complaints.filter(c => c.restaurantId === restaurant.id);
    const votes      = db.votes.filter(v => v.restaurantId === restaurant.id);
    const photos     = db.photos.filter(p => p.restaurantId === restaurant.id);

    res.json({
        ...restaurant,
        hygieneScore:    score,
        category,
        complaintsCount: complaints.length,
        complaints,
        votes: {
            clean:   votes.filter(v => v.vote === 'clean').length,
            unclean: votes.filter(v => v.vote === 'unclean').length,
            all:     votes
        },
        photos,
        latestPhoto: latestPhoto(restaurant.id)
    });
});

// ── Photos ────────────────────────────────────────────────────────────────────

/**
 * POST /api/restaurants/:id/photos
 * Upload a kitchen image for a restaurant.
 * Form-data: { photo: File, timestamp?: string }
 * restaurantId comes from the URL param.
 */
app.post('/api/restaurants/:id/photos', upload.single('photo'), (req, res) => {
    const restaurant = db.restaurants.find(r => r.id === req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });
    if (!req.file)   return res.status(400).json({ error: 'No photo file uploaded.' });

    const newPhoto = {
        id:           'p' + Date.now(),
        restaurantId: req.params.id,
        imageUrl:     `/uploads/${req.file.filename}`,
        timestamp:    req.body.timestamp || new Date().toISOString()
    };

    db.photos.push(newPhoto);
    saveDB();
    res.status(201).json(newPhoto);
});

// ── Complaints ────────────────────────────────────────────────────────────────

/**
 * POST /api/restaurants/:id/complaints
 * Submit a complaint for a restaurant.
 * Body: { issue: string }
 */
app.post('/api/restaurants/:id/complaints', (req, res) => {
    const restaurant = db.restaurants.find(r => r.id === req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    const { issue } = req.body || {};
    if (!issue) return res.status(400).json({ error: 'issue is required.' });

    const newComplaint = {
        id:           'c' + Date.now(),
        restaurantId: req.params.id,
        issue:        issue.trim(),
        timestamp:    new Date().toISOString()
    };

    db.complaints.push(newComplaint);
    saveDB();
    res.status(201).json(newComplaint);
});

// ── Votes ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/restaurants/:id/votes
 * Submit a vote for a restaurant.
 * Body: { vote: "clean" | "unclean" }
 */
app.post('/api/restaurants/:id/votes', (req, res) => {
    const restaurant = db.restaurants.find(r => r.id === req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found.' });

    const { vote } = req.body || {};
    if (!vote || !['clean', 'unclean'].includes(vote)) {
        return res.status(400).json({ error: 'vote must be "clean" or "unclean".' });
    }

    const newVote = {
        id:           'v' + Date.now(),
        restaurantId: req.params.id,
        vote,
        timestamp:    new Date().toISOString()
    };

    db.votes.push(newVote);
    saveDB();

    // Return the updated hygiene score along with the new vote
    const { score, category } = calcHygiene(req.params.id);
    res.status(201).json({ ...newVote, hygieneScore: score, category });
});

// ─── 404 for unknown API routes ───────────────────────────────────────────────

app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
});

// ─── START ────────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
    console.log('\x1b[32m%s\x1b[0m', '✔ ProofPlate Backend is running!');
    console.log(`📡 API Base URL : http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend     : http://localhost:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  POST   /api/restaurants               — Add restaurant');
    console.log('  GET    /api/restaurants               — Get all restaurants');
    console.log('  GET    /api/restaurants/:id           — Get restaurant details');
    console.log('  POST   /api/restaurants/:id/photos    — Upload kitchen image');
    console.log('  POST   /api/restaurants/:id/complaints— Submit complaint');
    console.log('  POST   /api/restaurants/:id/votes     — Submit vote (clean/unclean)');
});
