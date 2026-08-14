const express = require('express');
const router = express.Router();
const Politician = require('../models/Politician');
const Post = require('../models/Post');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// In-memory / curated map issues pool
let mapIssuesStore = [
  {
    id: 'geo_1',
    title: 'Cracked Flyover & Dangerous Potholes on Ring Road',
    category: 'Road & Infrastructure',
    lat: 28.6139,
    lng: 77.209,
    state: 'Delhi',
    constituency: 'New Delhi',
    status: 'reported', // 'reported', 'acknowledged', 'in_progress', 'resolved'
    reportedBy: 'AngryAloo_42',
    photoUrl: '/uploads/sample_pothole.jpg',
    corroborationCount: 14,
    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'geo_2',
    title: 'Critical Shortage of Anti-Rabies & Insulin at Civil Hospital',
    category: 'Healthcare',
    lat: 28.5355,
    lng: 77.391,
    state: 'Uttar Pradesh',
    constituency: 'Gautam Buddha Nagar',
    status: 'in_progress',
    reportedBy: 'RtiWarrior_91',
    photoUrl: '/uploads/sample_hospital.jpg',
    corroborationCount: 28,
    reportedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'geo_3',
    title: 'Unfinished Primary School Roof Leaking During Monsoon',
    category: 'Education',
    lat: 19.076,
    lng: 72.8777,
    state: 'Maharashtra',
    constituency: 'Mumbai South',
    status: 'resolved',
    reportedBy: 'DeshBhaktNagrik_10',
    photoUrl: '/uploads/sample_school.jpg',
    corroborationCount: 42,
    reportedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'geo_4',
    title: 'Illegal Sand Mining Truck Movement Damaging Rural Road',
    category: 'Environment',
    lat: 12.9716,
    lng: 77.5946,
    state: 'Karnataka',
    constituency: 'Bengaluru South',
    status: 'acknowledged',
    reportedBy: 'KisanAwaaz_77',
    photoUrl: '/uploads/sample_mining.jpg',
    corroborationCount: 19,
    reportedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

// @route GET /api/constituencies/pincode/:pincode
// @desc Resolve PIN code to constituency profile
router.get('/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Sample Indian PIN code mapping
    let constituencyName = 'New Delhi';
    let state = 'Delhi';
    let district = 'Central Delhi';

    if (pincode.startsWith('110')) {
      constituencyName = 'New Delhi';
      state = 'Delhi';
      district = 'Central Delhi';
    } else if (pincode.startsWith('400')) {
      constituencyName = 'Mumbai South';
      state = 'Maharashtra';
      district = 'Mumbai City';
    } else if (pincode.startsWith('560')) {
      constituencyName = 'Bengaluru South';
      state = 'Karnataka';
      district = 'Bengaluru Urban';
    } else if (pincode.startsWith('201')) {
      constituencyName = 'Gautam Buddha Nagar';
      state = 'Uttar Pradesh';
      district = 'Noida';
    } else if (pincode.startsWith('171')) {
      constituencyName = 'Shimla';
      state = 'Himachal Pradesh';
      district = 'Shimla';
    }

    const mp = await Politician.findOne({ constituency: constituencyName, house: 'Lok Sabha' });
    const mlas = await Politician.find({ state, house: 'Vidhan Sabha' }).limit(3);
    const relatedPosts = await Post.find({ constituency: constituencyName }).limit(5);

    res.json({
      success: true,
      pincode,
      constituency: constituencyName,
      district,
      state,
      demographics: {
        population: '1.42 Million',
        literacyRate: '88.7%',
        budgetAllocatedCrores: '₹145.8 Cr',
        budgetUtilizedCrores: '₹102.4 Cr',
        roadProjectsCompletedPct: '76%',
        hospitalsCount: 8,
        schoolsCount: 42,
      },
      mp,
      mlas,
      relatedPosts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/constituencies/map-issues
// @desc Get geotagged issue pins for Leaflet Map
router.get('/map-issues', async (req, res) => {
  res.json({ success: true, count: mapIssuesStore.length, issues: mapIssuesStore });
});

// @route POST /api/constituencies/map-issues
// @desc Pin-drop new civic issue on map
router.post('/map-issues', protect, async (req, res) => {
  try {
    const { title, category, lat, lng, state, constituency, photoUrl } = req.body;
    if (!title || !lat || !lng) {
      return res.status(400).json({ success: false, message: 'Title, Latitude and Longitude are required' });
    }

    const newIssue = {
      id: `geo_${Date.now()}`,
      title,
      category: category || 'Road & Infrastructure',
      lat: Number(lat),
      lng: Number(lng),
      state: state || req.user.state || 'Delhi',
      constituency: constituency || req.user.constituency || 'New Delhi',
      status: 'reported',
      reportedBy: req.user.handle,
      photoUrl: photoUrl || '/uploads/sample_pothole.jpg',
      corroborationCount: 1,
      reportedAt: new Date(),
    };

    mapIssuesStore.unshift(newIssue);

    res.status(201).json({
      success: true,
      message: 'Civic issue successfully pinned to constituency map!',
      issue: newIssue,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/constituencies/hawa-meter
// @desc 🌪️ "Hawa" Meter Trending Political Issues & Hashtags
router.get('/hawa-meter', async (req, res) => {
  try {
    const hawaTrends = [
      {
        rank: 1,
        hashtag: '#WaterCrisis',
        topic: 'Drinking Water Shortage & Tanker Mafia',
        postsCount: 4200,
        petitionsCount: 12,
        direction: 'exploding', // 'exploding', 'growing', 'fading'
        state: 'Maharashtra',
      },
      {
        rank: 2,
        hashtag: '#BrokenRoadsNashik',
        topic: 'Flyover Cracks & Pothole Negligence',
        postsCount: 2800,
        petitionsCount: 8,
        direction: 'growing',
        state: 'Maharashtra',
      },
      {
        rank: 3,
        hashtag: '#PowerCutsPune',
        topic: 'Unannounced 8-Hour Load Shedding',
        postsCount: 1900,
        petitionsCount: 4,
        direction: 'growing',
        state: 'Maharashtra',
      },
      {
        rank: 4,
        hashtag: '#TeacherVacancies',
        topic: 'Government School Staff Shortages',
        postsCount: 1200,
        petitionsCount: 3,
        direction: 'fading',
        state: 'Delhi',
      },
      {
        rank: 5,
        hashtag: '#HospitalMedicineScam',
        topic: 'Expired Medicines in State Dispensary',
        postsCount: 890,
        petitionsCount: 2,
        direction: 'exploding',
        state: 'Karnataka',
      },
    ];

    res.json({ success: true, hawaTrends });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
