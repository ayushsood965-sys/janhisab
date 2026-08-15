const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Politician = require('../models/Politician');
const Institution = require('../models/Institution');
const Post = require('../models/Post');
const Rating = require('../models/Rating');
const PromiseModel = require('../models/Promise');
const RtiTemplate = require('../models/RtiTemplate');
const Petition = require('../models/Petition');
const Bounty = require('../models/Bounty');
const NetaCard = require('../models/NetaCard');
const JukeboxTrack = require('../models/JukeboxTrack');
const AndolanRoom = require('../models/AndolanRoom');
const CmsConfig = require('../models/CmsConfig');
const { connectDB, closeDB } = require('../config/db');

function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting JanAudit Database Seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Politician.deleteMany({});
    await Institution.deleteMany({});
    await Post.deleteMany({});
    await Rating.deleteMany({});
    await PromiseModel.deleteMany({});
    await RtiTemplate.deleteMany({});
    await Petition.deleteMany({});
    await Bounty.deleteMany({});
    await NetaCard.deleteMany({});
    await JukeboxTrack.deleteMany({});
    await AndolanRoom.deleteMany({});
    await CmsConfig.deleteMany({});

    console.log('🧹 Existing data wiped.');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      fullName: 'Super Admin Guardian',
      handle: 'SuperAdmin_Nagrik',
      email: 'admin@janaudit.org',
      role: 'superadmin',
      verificationStatus: 'VERIFIED',
      phoneHash: hashPhone('9999999999'),
      password: defaultPassword,
      karmaTier: 'guardian',
      karmaPoints: 4500,
      jantaPoints: 5000,
      votingPower: 3.0,
      constituency: 'New Delhi',
      state: 'Delhi',
      verifiedNagrik: true,
      badges: [
        { id: 'platform_creator', name: 'Platform Architect', icon: '⚡', description: 'System Overseer & Governance Auditor' },
      ],
    });

    const moderatorUser = await User.create({
      fullName: 'Lokpal Jury Chief',
      handle: 'Lokpal_Jury_Head',
      email: 'jury@janaudit.org',
      role: 'moderator',
      verificationStatus: 'VERIFIED',
      phoneHash: hashPhone('8888888888'),
      password: defaultPassword,
      karmaTier: 'prabhari',
      karmaPoints: 1200,
      jantaPoints: 1500,
      votingPower: 2.0,
      constituency: 'New Delhi',
      state: 'Delhi',
      verifiedNagrik: true,
    });

    const citizen1 = await User.create({
      fullName: 'Aman Sharma',
      handle: 'AngryAloo_42',
      email: 'aloo@janaudit.org',
      role: 'citizen',
      verificationStatus: 'VERIFIED',
      phoneHash: hashPhone('7777777777'),
      password: defaultPassword,
      karmaTier: 'sakriya',
      karmaPoints: 340,
      jantaPoints: 850,
      votingPower: 1.0,
      constituency: 'New Delhi',
      state: 'Delhi',
      verifiedNagrik: true,
      badges: [
        { id: 'fact_hunter', name: 'Fact Hunter', icon: '🔍', description: 'Discovered 5+ verified RTI disclosures' },
        { id: 'road_reporter', name: 'Road Reporter', icon: '🚧', description: 'Reported 10+ geotagged infrastructure flaws' },
      ],
    });

    const citizen2 = await User.create({
      fullName: 'Priya Iyer',
      handle: 'ChaiPeCharcha_99',
      email: 'chai@janaudit.org',
      role: 'citizen',
      verificationStatus: 'VERIFIED',
      phoneHash: hashPhone('6666666666'),
      password: defaultPassword,
      karmaTier: 'nagrik',
      karmaPoints: 80,
      jantaPoints: 300,
      votingPower: 0.5,
      constituency: 'Mumbai South',
      state: 'Maharashtra',
    });

    const representativePending = await User.create({
      fullName: 'Dr. Vikas Kumar (MP Candidate)',
      handle: 'MP_VikasKumar',
      email: 'vikas.mp@sansad.nic.in',
      role: 'representative',
      verificationStatus: 'PENDING_ADMIN_VERIFICATION',
      credentialsDoc: 'https://eci.gov.in/affidavits/2024/vikas_kumar_official_id.pdf',
      phoneHash: hashPhone('5555555555'),
      password: defaultPassword,
      karmaTier: 'prabhari',
      karmaPoints: 600,
      jantaPoints: 1000,
      votingPower: 2.0,
      constituency: 'New Delhi',
      state: 'Delhi',
    });

    console.log('✅ Users seeded.');

    // 2. Seed Politicians
    const p1 = await Politician.create({
      name: 'Rajesh Verma',
      party: 'Democratic People Front',
      partySymbol: '🪷',
      state: 'Delhi',
      constituency: 'New Delhi',
      house: 'Lok Sabha',
      roleTitle: 'Member of Parliament (MP)',
      education: 'Master of Public Policy (Oxford)',
      age: 48,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      metrics: {
        attendanceRate: 94,
        questionsAsked: 240,
        debatesParticipated: 52,
        billsIntroduced: 6,
        criminalCasesPending: 0,
        criminalCasesConvicted: 0,
        fundUtilizationPct: 91,
        fundSanctionedCrores: 17.5,
        fundUtilizedCrores: 15.9,
        rtiComplianceRate: 88,
        totalVerifiedEvidenceCount: 18,
      },
      assets: {
        declaredAssets2019: 3.2,
        declaredAssets2024: 4.9,
        assetGrowthPct: 53,
        marketBenchmarkGrowthPct: 74,
        assetGrowthAnomaly: false,
        declaredLiabilitiesCrores: 0.4,
        declaredIncomeSources: ['Agricultural Land Rental', 'Consulting & Legal Practice'],
        assetHistory: [
          { year: 2014, amountCrores: 2.1 },
          { year: 2019, amountCrores: 3.2 },
          { year: 2024, amountCrores: 4.9 },
        ],
      },
      impactScore: 88.5,
      badgeTier: 'Kaam Karne Wala',
      badgeAltName: 'Actually Does Stuff',
      trendDirection: 'improving',
      trendChange: 4.2,
      scoreBreakdown: {
        objectiveData: 92,
        verifiedOutcomes: 85,
        communitySentiment: 88,
        trustRecency: 84,
      },
      divergence: {
        hasDivergence: false,
        kaamScore: 92,
        jantaVoice: 88,
        divergenceReason: '✅ Public sentiment closely matches objective governance data.',
      },
      dimensions: {
        infrastructure: 86,
        accessibility: 91,
        promiseKeeping: 84,
        transparency: 94,
        legislative: 92,
        social: 87,
        economic: 85,
      },
      promiseStats: {
        total: 12,
        completed: 8,
        inProgress: 3,
        failed: 1,
        notStarted: 0,
        jumlaPct: 8.3,
      },
      officialResponses: [
        {
          author: 'Adv. M. Khanna',
          designation: 'Official Parliamentary Secretary',
          text: 'The Sarojini Nagar Model Secondary School renovation tender has been awarded. Inspection logs available under RTI portal.',
          documentUrl: '/uploads/model_school_tender.pdf',
          issueRef: 'School Infrastructure Upgrade',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          verified: true,
        },
      ],
      profileAnthem: {
        title: 'Vikas Ki Awaaz',
        artist: 'Gully Civic Beats',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        upvotes: 420,
      },
    });

    const p2 = await Politician.create({
      name: 'Rameshwar "Netaji" Sharma',
      party: 'Rashtriya Pragati Dal',
      partySymbol: '✋',
      state: 'Delhi',
      constituency: 'Chandni Chowk',
      house: 'Vidhan Sabha',
      roleTitle: 'Member of Legislative Assembly (MLA)',
      education: 'Class 12 Pass',
      age: 58,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      metrics: {
        attendanceRate: 28,
        questionsAsked: 14,
        debatesParticipated: 4,
        billsIntroduced: 0,
        criminalCasesPending: 4,
        criminalCasesConvicted: 0,
        criminalChargesDetails: ['BNS Sec 318 (Cheating)', 'BNS Sec 189 (Unlawful Assembly)', 'Public Property Damage'],
        fundUtilizationPct: 32,
        fundSanctionedCrores: 12.0,
        fundUtilizedCrores: 3.8,
        rtiComplianceRate: 22,
        totalVerifiedEvidenceCount: 3,
      },
      assets: {
        declaredAssets2019: 1.8,
        declaredAssets2024: 34.6,
        assetGrowthPct: 1822,
        marketBenchmarkGrowthPct: 74,
        assetGrowthAnomaly: true,
        declaredLiabilitiesCrores: 4.2,
        declaredIncomeSources: ['Dairy Business & Unspecified Other Sources'],
        assetHistory: [
          { year: 2014, amountCrores: 0.9 },
          { year: 2019, amountCrores: 1.8 },
          { year: 2024, amountCrores: 34.6 },
        ],
      },
      impactScore: 24.0,
      badgeTier: 'Jumla Champion',
      badgeAltName: 'Ghotala Specialist',
      trendDirection: 'declining',
      trendChange: -8.5,
      scoreBreakdown: {
        objectiveData: 18,
        verifiedOutcomes: 24,
        communitySentiment: 82, // Suspicious IT cell push!
        trustRecency: 30,
      },
      divergence: {
        hasDivergence: true,
        kaamScore: 18,
        jantaVoice: 82,
        divergenceReason:
          '⚠️ Sentiment–Performance Mismatch Detected: High public ratings despite low objective work metrics — possible coordinated rating activity under review.',
      },
      dimensions: {
        infrastructure: 22,
        accessibility: 30,
        promiseKeeping: 15,
        transparency: 12,
        legislative: 18,
        social: 25,
        economic: 20,
      },
      promiseStats: {
        total: 16,
        completed: 2,
        inProgress: 3,
        failed: 8,
        notStarted: 3,
        jumlaPct: 50.0,
      },
      profileAnthem: {
        title: 'Ghotale Ka Raja (Satirical Diss Track)',
        artist: 'MC JanAwaaz',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        upvotes: 1890,
      },
    });

    const p3 = await Politician.create({
      name: 'Anita Desai',
      party: 'Janata Vikas Party',
      partySymbol: '🐘',
      state: 'Karnataka',
      constituency: 'Bengaluru South',
      house: 'Lok Sabha',
      roleTitle: 'Member of Parliament (MP)',
      education: 'B.Tech (Computer Science)',
      age: 44,
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      metrics: {
        attendanceRate: 88,
        questionsAsked: 195,
        debatesParticipated: 44,
        billsIntroduced: 4,
        criminalCasesPending: 0,
        criminalCasesConvicted: 0,
        fundUtilizationPct: 84,
        fundSanctionedCrores: 17.5,
        fundUtilizedCrores: 14.7,
        rtiComplianceRate: 82,
        totalVerifiedEvidenceCount: 14,
      },
      assets: {
        declaredAssets2019: 6.5,
        declaredAssets2024: 10.2,
        assetGrowthPct: 56,
        marketBenchmarkGrowthPct: 74,
        assetGrowthAnomaly: false,
        declaredLiabilitiesCrores: 1.1,
        declaredIncomeSources: ['IT Tech Enterprise Dividends'],
        assetHistory: [
          { year: 2014, amountCrores: 4.1 },
          { year: 2019, amountCrores: 6.5 },
          { year: 2024, amountCrores: 10.2 },
        ],
      },
      impactScore: 81.5,
      badgeTier: 'Kaam Karne Wala',
      badgeAltName: 'Actually Does Stuff',
      trendDirection: 'improving',
      trendChange: 3.1,
      scoreBreakdown: {
        objectiveData: 86,
        verifiedOutcomes: 78,
        communitySentiment: 80,
        trustRecency: 80,
      },
      divergence: {
        hasDivergence: false,
        kaamScore: 86,
        jantaVoice: 80,
        divergenceReason: '✅ Public sentiment closely matches objective governance data.',
      },
      dimensions: {
        infrastructure: 82,
        accessibility: 85,
        promiseKeeping: 78,
        transparency: 88,
        legislative: 84,
        social: 80,
        economic: 82,
      },
      promiseStats: {
        total: 10,
        completed: 6,
        inProgress: 3,
        failed: 1,
        notStarted: 0,
        jumlaPct: 10.0,
      },
    });

    const p4 = await Politician.create({
      name: 'Sanjay Gaikwad',
      party: 'Maharashtra Kranti Dal',
      partySymbol: '🏹',
      state: 'Maharashtra',
      constituency: 'Mumbai South',
      house: 'Lok Sabha',
      roleTitle: 'Member of Parliament (MP)',
      education: 'B.Com',
      age: 62,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      metrics: {
        attendanceRate: 42,
        questionsAsked: 38,
        debatesParticipated: 11,
        billsIntroduced: 1,
        criminalCasesPending: 3,
        criminalCasesConvicted: 0,
        criminalChargesDetails: ['Extortion Allegation', 'Unlawful Assembly'],
        fundUtilizationPct: 48,
        fundSanctionedCrores: 17.5,
        fundUtilizedCrores: 8.4,
        rtiComplianceRate: 40,
        totalVerifiedEvidenceCount: 6,
      },
      assets: {
        declaredAssets2019: 8.2,
        declaredAssets2024: 78.4,
        assetGrowthPct: 856,
        marketBenchmarkGrowthPct: 74,
        assetGrowthAnomaly: true,
        declaredLiabilitiesCrores: 9.5,
        declaredIncomeSources: ['Real Estate Brokerage & Transport Logistics'],
        assetHistory: [
          { year: 2014, amountCrores: 4.0 },
          { year: 2019, amountCrores: 8.2 },
          { year: 2024, amountCrores: 78.4 },
        ],
      },
      impactScore: 36.2,
      badgeTier: 'Sust Neta',
      badgeAltName: 'Missing Action Hero',
      trendDirection: 'declining',
      trendChange: -5.4,
      scoreBreakdown: {
        objectiveData: 35,
        verifiedOutcomes: 38,
        communitySentiment: 40,
        trustRecency: 32,
      },
      divergence: {
        hasDivergence: false,
        kaamScore: 35,
        jantaVoice: 40,
        divergenceReason: '✅ Public sentiment closely matches objective governance data.',
      },
      dimensions: {
        infrastructure: 38,
        accessibility: 32,
        promiseKeeping: 30,
        transparency: 28,
        legislative: 35,
        social: 44,
        economic: 36,
      },
      promiseStats: {
        total: 14,
        completed: 3,
        inProgress: 4,
        failed: 5,
        notStarted: 2,
        jumlaPct: 35.7,
      },
    });

    console.log('✅ Politicians seeded.');

    // 3. Seed Public Institutions
    await Institution.create([
      {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        category: 'hospital',
        state: 'Delhi',
        district: 'South Delhi',
        constituency: 'New Delhi',
        address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
        headOfficer: 'Dr. M. Srinivas',
        headOfficerDesignation: 'Director',
        overallScore: 82,
        ratingsCount: 420,
        dimensions: {
          serviceQuality: 88,
          responsiveness: 76,
          cleanliness: 84,
          corruptionFreeScore: 89,
          infrastructureQuality: 92,
        },
        budgetAllocatedCrores: 4100,
        budgetUtilizedCrores: 3890,
      },
      {
        name: 'Municipal Corporation Ward Office #14 (Civil Lines)',
        category: 'municipality',
        state: 'Delhi',
        district: 'Central Delhi',
        constituency: 'Chandni Chowk',
        address: 'Rajpur Road, Civil Lines, Delhi',
        headOfficer: 'Er. S. K. Gupta',
        headOfficerDesignation: 'Executive Engineer (MCD)',
        overallScore: 38,
        ratingsCount: 190,
        dimensions: {
          serviceQuality: 34,
          responsiveness: 32,
          cleanliness: 28,
          corruptionFreeScore: 40,
          infrastructureQuality: 42,
        },
        budgetAllocatedCrores: 18.5,
        budgetUtilizedCrores: 9.2,
      },
    ]);

    console.log('✅ Public Institutions seeded.');

    // 4. Seed Promises with Promise vs Reality Sliders
    await PromiseModel.create([
      {
        politician: p2._id,
        politicianName: p2.name,
        title: 'Construct 200-Bed Super Specialty Hospital at Asaf Ali Road',
        description: 'Complete multi-specialty trauma center with free dialysis unit within 24 months of taking oath.',
        category: 'Healthcare',
        manifestoYear: 2019,
        status: 'failed',
        completionPercentage: 10,
        isJumlaFlagged: true,
        promiseVsReality: {
          hasSlider: true,
          promiseImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
          promiseCaption: '2019 Rally Blueprint: "State of the Art 200-Bed Trauma Care"',
          realityImageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
          realityCaption: '2026 Ground Reality: Flooded foundation trench and abandoned rusted iron rebars',
        },
        timeline: [
          { date: new Date('2019-04-10'), title: 'Manifesto Pledge', description: 'Promised in Public Rally', statusTag: 'not_started' },
          { date: new Date('2021-08-15'), title: 'Foundation Stone Laid', description: 'Photo op ceremony with zero budget release', statusTag: 'in_progress' },
          { date: new Date('2024-05-01'), title: 'Deadline Expired', description: 'RTI confirms contractor contract canceled', statusTag: 'failed' },
        ],
      },
      {
        politician: p1._id,
        politicianName: p1.name,
        title: 'Solarization & Smart Classroom Upgrade across 18 Government Schools',
        description: 'Install 50kW rooftop solar panels and interactive digital boards in all secondary public schools in constituency.',
        category: 'Education',
        manifestoYear: 2024,
        status: 'completed',
        completionPercentage: 100,
        isJumlaFlagged: false,
        promiseVsReality: {
          hasSlider: true,
          promiseImageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
          promiseCaption: 'Pledge: "100% Green Powered High-Tech Public Classrooms"',
          realityImageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
          realityCaption: 'Delivered: Rooftop solar installed and running in 18 schools',
        },
        timeline: [
          { date: new Date('2024-03-01'), title: 'Tender Sanctioned', description: 'MPLAD fund allocated ₹2.8 Crores', statusTag: 'in_progress' },
          { date: new Date('2025-06-20'), title: 'Installation Complete', description: 'Third-party green audit verified', statusTag: 'completed' },
        ],
      },
    ]);

    console.log('✅ Promises & Wada Tracker seeded.');

    // 5. Seed Voice Wall Posts
    await Post.create([
      {
        author: citizen1._id,
        authorHandle: citizen1.handle,
        authorKarmaTier: citizen1.karmaTier,
        postType: 'evidence',
        title: 'RTI EXPOSE: ₹14.8 Crore Ring Road resurfacing peeled off in first 3 monsoon showers',
        content: 'I filed an RTI with Delhi PWD regarding the bituminous thickness specification for the Sarojini Nagar underpass. The official test report reveals bitumen content was 2.8% vs mandatory 5.5% Indian Road Congress (IRC) standard. Here is the certified government lab report copy.',
        evidenceLevel: 'verified',
        evidenceSources: [
          {
            title: 'Delhi PWD Quality Control Testing Lab Report #PWD-QC-2026-44',
            url: 'https://janaudit.org/docs/rti_pwd_qc.pdf',
            sourceType: 'rti_document',
          },
        ],
        isCorroborated: true,
        corroborationCount: 48,
        state: 'Delhi',
        constituency: 'New Delhi',
        category: 'Infrastructure',
        hashtags: ['#RoadScam', '#PWDExpose', '#SarojiniNagar', '#JantaAudit'],
        taggedPoliticians: [p2._id],
        roastToastTag: 'peak_corruption',
        reactions: { fire: 342, skull: 180, rofl: 24, clown: 88, solidarity: 420, needsEvidence: 2 },
        comments: [
          {
            author: citizen2._id,
            authorHandle: citizen2.handle,
            authorKarmaTier: citizen2.karmaTier,
            content: 'I live in this exact neighborhood. Two scooters slipped on this gravel yesterday. Solid evidence!',
            upvotes: 45,
          },
        ],
        boostScore: 120,
      },
      {
        author: citizen2._id,
        authorHandle: citizen2.handle,
        authorKarmaTier: citizen2.karmaTier,
        postType: 'meme',
        title: 'When Netaji explains where the 1,978% asset growth came from',
        content: 'Sensex was giving 12% CAGR, while Netaji was compounding at 300% from "unspecified organic farming". Warren Buffett needs coaching from our leaders.',
        mediaUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80',
        evidenceLevel: 'likely',
        evidenceSources: [
          {
            title: 'Election Commission of India 2024 Sworn Affidavit Form 26',
            url: 'https://myneta.info',
            sourceType: 'affidavit',
          },
        ],
        state: 'Delhi',
        constituency: 'Chandni Chowk',
        category: 'General Satire',
        hashtags: ['#FollowTheMoney', '#NetajiWealth', '#Bhrashtameter'],
        taggedPoliticians: [p2._id],
        roastToastTag: 'clown_behavior',
        reactions: { fire: 512, skull: 320, rofl: 640, clown: 410, solidarity: 290, needsEvidence: 5 },
      },
      {
        author: citizen1._id,
        authorHandle: citizen1.handle,
        authorKarmaTier: citizen1.karmaTier,
        postType: 'poll',
        title: 'POLL: What should be the #1 priority for the remaining ₹4.2 Crore unspent MPLAD funds?',
        content: 'Our MP has 6 months left in the financial cycle with ₹4.2 Cr unutilized balance. Cast your vote to show where public pressure belongs.',
        state: 'Delhi',
        constituency: 'New Delhi',
        category: 'Governance',
        hashtags: ['#MPLADFund', '#JanAudit', '#PublicBudget'],
        pollData: {
          question: 'Where should ₹4.2 Crore MPLAD funds be deployed immediately?',
          options: [
            { text: '🏥 24x7 Free Dialysis & Diagnostic Centers at Civil Hospital', votes: 340 },
            { text: '🛣️ Complete Pedestrian Pavements & Drainage on Outer Ring Road', votes: 215 },
            { text: '⚡ Solar Lights & CCTV Cameras for Women Safety in Wards', votes: 410 },
            { text: '🏫 High School Science Labs & Computer Centers', votes: 160 },
          ],
          voters: [],
        },
        reactions: { fire: 180, skull: 12, rofl: 8, clown: 4, solidarity: 380, needsEvidence: 0 },
      },
    ]);

    console.log('✅ Voice Wall Posts seeded.');

    // 6. Seed RTI Templates
    await RtiTemplate.create([
      {
        title: 'RTI: Road Construction Quality & Contractor Inspection Reports',
        category: 'Road & Infrastructure',
        department: 'Public Works Department (PWD)',
        description: 'Standard application seeking bitumen composition, quality test logs, warranty clauses, and penalty history for recently resurfaced roads.',
        targetAuthority: 'Chief Engineer / PIO (PWD)',
        applicationQuestions: [
          { questionNumber: 1, text: 'Provide a certified copy of the Work Order and Detailed Project Report (DPR) for the road stretch constructed from [Start Point] to [End Point].' },
          { questionNumber: 2, text: 'Provide certified copies of Quality Control Lab Test reports regarding bitumen grade, bituminous layer thickness, and compressive core strength.' },
          { questionNumber: 3, text: 'Provide the defect liability/warranty period mentioned in the tender contract and total security deposit held back from contractor.' },
          { questionNumber: 4, text: 'Provide details of any complaints received regarding potholes/cracks during the warranty period and penal action initiated against the contractor.' },
        ],
        filingFee: '₹10 (Postal Order / Online RTI Portal)',
        pioDesignation: 'Public Information Officer (PIO), Office of the Chief Engineer (Roads)',
        downloadCount: 1420,
        uploadedResponses: [
          {
            userHandle: 'AngryAloo_42',
            title: 'Official PWD Quality Test Failure Report — Sarojini Nagar Stretch',
            documentUrl: '/uploads/rti_pwd_qc.pdf',
            summary: 'Certified lab report confirms contractor used 2.8% bitumen against required 5.5%. Notice served.',
            keyExpose: 'Contractor blacklisting proceedings initiated after RTI exposure.',
            verifiedByJury: true,
          },
        ],
      },
      {
        title: 'RTI: Government Hospital Essential Medicine Availability & Procurement',
        category: 'Hospital & Medicines',
        department: 'Department of Health & Family Welfare',
        description: 'Application seeking daily stock registers of essential life-saving medicines, insulin, and anti-rabies vaccines.',
        targetAuthority: 'Medical Superintendent / PIO (State Health)',
        applicationQuestions: [
          { questionNumber: 1, text: 'Provide a certified copy of the Essential Medicine List (EML) approved for [Hospital Name] for the current financial year.' },
          { questionNumber: 2, text: 'Provide the stock register extract of life-saving drugs (including Anti-Rabies, Insulin, and Paracetamol IV) for the past 90 days.' },
          { questionNumber: 3, text: 'Provide details of instances where patients were referred to buy medicines from private pharmacies outside the hospital premise.' },
        ],
        filingFee: '₹10',
        pioDesignation: 'PIO, Office of the Chief Medical Officer',
        downloadCount: 890,
      },
    ]);

    console.log('✅ RTI Templates seeded.');

    // 7. Seed Petitions
    await Petition.create([
      {
        creator: citizen1._id,
        creatorHandle: citizen1.handle,
        title: 'Install 24x7 CCTV & Emergency Help Poles at Sarojini Nagar & Lajpat Metro Walkways',
        description: 'Repeated dark spots and broken streetlights along the 1.2km pedestrian walkway between Sarojini Nagar metro and market have created unsafe conditions for women commuters after 8 PM. We demand immediate installation of 16 high-mast solar CCTV cameras and police panic buttons.',
        category: 'Women Safety',
        targetPoliticians: [p1._id, p2._id],
        targetDepartment: 'Delhi Police & Municipal Corporation of Delhi',
        targetOfficialDesignation: 'Deputy Commissioner of Police (South District)',
        signatureGoal: 2000,
        currentSignatures: 1428,
        milestoneReached: 1000,
        status: 'notice_dispatched',
        noticeDispatchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        signatures: [
          { user: citizen1._id, handle: citizen1.handle, comment: 'Essential for women safety.', signedAt: new Date() },
          { user: citizen2._id, handle: citizen2.handle, comment: 'Full support. High time this is addressed.', signedAt: new Date() },
        ],
        isFeatured: true,
      },
    ]);

    console.log('✅ Petitions seeded.');

    // 8. Seed Bounties
    await Bounty.create([
      {
        creator: citizen1._id,
        creatorHandle: citizen1.handle,
        title: 'Obtain Certified RTI Tender Copy for Chandni Chowk Beautification Phase 2 (₹28 Cr)',
        description: 'Pool reward for any citizen or journalist who obtains and uploads the official expenditure bill breakdown and vendor selection minutes for Phase 2 redevelopment.',
        category: 'RTI Document',
        targetPolitician: p2._id,
        targetDepartment: 'Shahjahanabad Redevelopment Corporation',
        rewardPoints: 1250,
        contributors: [
          { user: citizen1._id, handle: citizen1.handle, points: 250, contributedAt: new Date() },
          { user: citizen2._id, handle: citizen2.handle, points: 500, contributedAt: new Date() },
          { user: adminUser._id, handle: adminUser.handle, points: 500, contributedAt: new Date() },
        ],
        status: 'open',
      },
    ]);

    console.log('✅ Bounties seeded.');

    // 9. Seed Collectible Neta Cards
    await NetaCard.create([
      {
        politician: p1._id,
        cardCode: 'NETA_CARD_VERMA_01',
        politicianName: p1.name,
        photo: p1.photo,
        party: p1.party,
        state: p1.state,
        constituency: p1.constituency,
        house: p1.house,
        rarity: 'rare',
        specialTitle: 'The Infrastructure Builder',
        tagline: 'High Attendance & 91% Fund Utilization',
        roastQuote: '"Speaks less on TV, delivers more on ground."',
        impactScore: p1.impactScore,
        attendanceRate: p1.metrics.attendanceRate,
        promisesKeptRatio: '8/12 Kept',
        criminalCasesCount: 0,
        assetGrowthPct: 53,
        glowColor: '#10B981',
        cardType: 'lion_of_janta',
      },
      {
        politician: p2._id,
        cardCode: 'NETA_CARD_SHARMA_02',
        politicianName: p2.name,
        photo: p2.photo,
        party: p2.party,
        state: p2.state,
        constituency: p2.constituency,
        house: p2.house,
        rarity: 'legendary',
        specialTitle: 'Jumla Champion of the North',
        tagline: '1,822% Wealth Growth | 28% Attendance',
        roastQuote: '"Specialist in laying foundation stones that never rise above grass level."',
        impactScore: p2.impactScore,
        attendanceRate: p2.metrics.attendanceRate,
        promisesKeptRatio: '2/16 Kept',
        criminalCasesCount: 4,
        assetGrowthPct: 1822,
        glowColor: '#EF4444',
        cardType: 'jumla_king',
      },
    ]);

    console.log('✅ Collectible Neta Cards seeded.');

    // 10. Seed Protest Jukebox Tracks
    await JukeboxTrack.create([
      {
        title: 'Ghotale Ka Raja (The Scam Anthem)',
        artist: 'MC JanAwaaz feat. Gully Citizens',
        genre: 'Protest Rap',
        duration: '3:12',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        lyricsSnippet: 'Road banayi kal, baarish mein beh gayi aaj... Puchte hain hisab toh kehte hain chup raho...',
        targetPolitician: p2._id,
        targetPoliticianName: p2.name,
        isVoiceMasked: false,
        upvotes: 1890,
        plays: 14200,
        isTrending: true,
      },
      {
        title: 'Whistleblower Tape: PWD Contractor Kickback Wire',
        artist: 'Anonymous Insider #88',
        genre: 'Whistleblower Tape (Masked)',
        duration: '1:45',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        lyricsSnippet: '[Voice Altered] Executive Engineer demanded 12% cash cut before clearing monsoon desilting bill...',
        isVoiceMasked: true,
        upvotes: 2450,
        plays: 19800,
        isTrending: true,
      },
    ]);

    console.log('✅ Protest Jukebox seeded.');

    // 11. Seed Andolan 48h Room
    await AndolanRoom.create({
      roomCode: 'ANDOLAN-DL-CLEANAIR-01',
      title: 'Delhi Clean Air & Anti-Smog Action Space',
      description: '48-Hour ephemeral coordination room for citizens demanding accountability on smog tower inspections.',
      hashtag: '#CleanAirDelhi',
      state: 'Delhi',
      constituency: 'New Delhi',
      activeParticipants: 42,
      peakParticipants: 180,
      messages: [
        {
          senderHandle: 'AngryAloo_42',
          senderKarmaTier: 'sakriya',
          text: 'Air quality index crossed 420 at ITO intersection. Checking if water sprinklers are operational.',
          timestamp: new Date(),
        },
        {
          senderHandle: 'Lokpal_Jury_Head',
          senderKarmaTier: 'prabhari',
          text: '🚨 Safety Alert: Drone surveillance reported near Vikas Marg protest perimeter. Stay peaceful and record geotagged streams.',
          isSafetyAlert: true,
          timestamp: new Date(),
        },
      ],
      safetyAlerts: [
        {
          alertText: 'Police barricades deployed at Ring Road junction 4. Divert via Barapullah corridor.',
          reportedBy: 'Lokpal_Jury_Head',
          timestamp: new Date(),
        },
      ],
    });

    console.log('✅ Andolan 48h Room seeded.');

    // 12. Seed Global CMS Config
    await CmsConfig.create({
      configKey: 'global_cms_config',
      formulaWeights: {
        objectiveDataWeight: 0.45,
        verifiedOutcomesWeight: 0.25,
        communitySentimentWeight: 0.20,
        trustRecencyWeight: 0.10,
      },
      antiManipulation: {
        quadraticVotingEnabled: true,
        burstFreezeThresholdPct: 40,
        burstWindowHours: 2,
        ratingCooldownDays: 90,
        constituencyVoterMultiplier: 3.0,
      },
      modules: {
        voiceWall: true,
        politicians: true,
        institutions: true,
        promiseTracker: true,
        rtiFactory: true,
        petitions: true,
        constituencyMaps: true,
        memeStudio: true,
        protestJukebox: true,
        bountyBoard: true,
        netaCards: true,
        andolanMode: true,
        communityJury: true,
      },
      announcement: {
        enabled: true,
        text: '⚖️ JanAudit: Pro-Democracy. Pro-Transparency. Every promise tracked, every claim evidenced, every score explainable.',
        link: '/about',
        badge: 'PUBLIC AUDIT LIVE',
      },
    });

    console.log('✅ Global CMS Config seeded.');
    console.log('🎉 JanAudit Complete Seed Data Generation Finished Successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

// If run directly via node seed/seedData.js
if (require.main === module) {
  connectDB().then(async () => {
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}

module.exports = { seedDatabase };
