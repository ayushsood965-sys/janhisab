const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Politician = require('../models/Politician');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload, sanitizeUpload } = require('../middleware/uploadMiddleware');

// @route GET /api/posts
// @desc Get Voice Wall feed with filters & evidence tags
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      type,
      category,
      constituency,
      state,
      hashtag,
      evidenceLevel,
      search,
      sort = 'trending',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (type && type !== 'all') filter.postType = type;
    if (category && category !== 'All') filter.category = category;
    if (constituency && constituency !== 'All') filter.constituency = constituency;
    if (state && state !== 'All') filter.state = state;
    if (hashtag) filter.hashtags = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (evidenceLevel && evidenceLevel !== 'all') filter.evidenceLevel = evidenceLevel;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { hashtags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'trending') {
      sortOptions = { boostScore: -1, 'reactions.fire': -1, createdAt: -1 };
    } else if (sort === 'verified_first') {
      sortOptions = { isCorroborated: -1, evidenceLevel: 1, createdAt: -1 };
    } else if (sort === 'top_roast') {
      sortOptions = { 'reactions.skull': -1, 'reactions.clown': -1 };
    }

    const total = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .populate('taggedPoliticians', 'name photo party constituency state impactScore')
      .populate('taggedInstitutions', 'name category state constituency')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      posts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts
// @desc Create new post with content friction checks
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      content,
      postType = 'text',
      mediaUrl,
      evidenceLevel = 'opinion',
      evidenceSources = [],
      state,
      constituency,
      category,
      hashtags = [],
      taggedPoliticians = [],
      taggedInstitutions = [],
      roastToastTag = 'none',
      pollData,
      forceBypassFriction = false,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    // Content Friction Check:
    // If user is tagging a politician with a serious claim/roast but has 0 evidence sources
    const hasAllegation = taggedPoliticians.length > 0 && ['clown_behavior', 'peak_corruption', 'sleeper_cell'].includes(roastToastTag);
    const hasEvidence = evidenceSources.length > 0 || evidenceLevel === 'verified' || evidenceLevel === 'likely';

    let isFrictionUnverified = false;
    let finalEvidenceLevel = evidenceLevel;

    if (hasAllegation && !hasEvidence && !forceBypassFriction) {
      return res.status(200).json({
        success: false,
        frictionTriggered: true,
        message: 'Adding a source strengthens your post! Want to attach an RTI, news link, or photo? If you proceed without evidence, your post will route into the Unverified public bucket until corroborated.',
      });
    }

    if (hasAllegation && !hasEvidence && forceBypassFriction) {
      isFrictionUnverified = true;
      finalEvidenceLevel = 'opinion';
    }

    const user = await User.findById(req.user._id);

    const post = await Post.create({
      author: user._id,
      authorHandle: user.handle,
      authorKarmaTier: user.karmaTier,
      postType,
      title,
      content,
      mediaUrl: mediaUrl || '',
      evidenceLevel: finalEvidenceLevel,
      evidenceSources,
      state: state || user.state || 'National',
      constituency: constituency || user.constituency || 'General',
      category: category || 'Governance',
      hashtags,
      taggedPoliticians,
      taggedInstitutions,
      roastToastTag,
      isFrictionUnverified,
      pollData: postType === 'poll' && pollData ? pollData : undefined,
    });

    // Reward XP
    user.jantaPoints += 25;
    user.karmaPoints += 15;
    user.updateKarmaTier();
    await user.save();

    const populatedPost = await Post.findById(post._id)
      .populate('taggedPoliticians', 'name photo party constituency state impactScore')
      .populate('taggedInstitutions', 'name category state constituency');

    res.status(201).json({
      success: true,
      message: 'Post published successfully!',
      post: populatedPost,
      userKarma: { karmaPoints: user.karmaPoints, jantaPoints: user.jantaPoints, tier: user.karmaTier },
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/:id/react
// @desc Custom political reactions (fire, skull, rofl, clown, solidarity, needsEvidence)
router.post('/:id/react', protect, async (req, res) => {
  try {
    const { reactionType } = req.body; // 'fire', 'skull', 'rofl', 'clown', 'solidarity', 'needsEvidence'
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (!post.reactions[reactionType] !== undefined) {
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
    }

    // Record user reaction
    post.userReactions.push({
      userId: req.user._id,
      reactionType,
    });

    // Boost score slightly
    post.boostScore += reactionType === 'fire' ? 3 : reactionType === 'solidarity' ? 2 : 1;

    await post.save();

    res.json({
      success: true,
      reactions: post.reactions,
      boostScore: post.boostScore,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/:id/comment
// @desc Add comment to post
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { content, evidenceUrl } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findById(req.user._id);

    post.comments.push({
      author: user._id,
      authorHandle: user.handle,
      authorKarmaTier: user.karmaTier,
      content,
      evidenceUrl: evidenceUrl || '',
      createdAt: new Date(),
    });

    // Reward points
    user.jantaPoints += 5;
    await user.save();
    await post.save();

    res.json({
      success: true,
      message: 'Comment added',
      comments: post.comments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/:id/corroborate
// @desc "Seal of Janta" community corroboration
router.post('/:id/corroborate', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.corroborators.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You have already corroborated this report.' });
    }

    post.corroborators.push(req.user._id);
    post.corroborationCount += 1;

    // If 3+ independent citizens corroborate, award "Seal of Janta"
    if (post.corroborationCount >= 3) {
      post.isCorroborated = true;
      if (post.evidenceLevel === 'opinion' || post.evidenceLevel === 'likely') {
        post.evidenceLevel = 'verified';
      }
      post.isFrictionUnverified = false;
    }

    await post.save();

    res.json({
      success: true,
      message: 'Corroboration recorded! Thank you for strengthening community truth.',
      corroborationCount: post.corroborationCount,
      isCorroborated: post.isCorroborated,
      evidenceLevel: post.evidenceLevel,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/:id/boost
// @desc Spend Janta Points to boost post visibility
router.post('/:id/boost', protect, async (req, res) => {
  try {
    const { pointsToSpend = 50 } = req.body;
    const user = await User.findById(req.user._id);

    if (user.jantaPoints < pointsToSpend) {
      return res.status(400).json({ success: false, message: 'Insufficient Janta Points to boost.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    user.jantaPoints -= pointsToSpend;
    post.boostScore += Number(pointsToSpend);

    await user.save();
    await post.save();

    res.json({
      success: true,
      message: `Post boosted by +${pointsToSpend} visibility points!`,
      boostScore: post.boostScore,
      userRemainingPoints: user.jantaPoints,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/:id/vote-poll
// @desc Vote in community poll
router.post('/:id/vote-poll', protect, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || post.postType !== 'poll' || !post.pollData) {
      return res.status(400).json({ success: false, message: 'Invalid poll post.' });
    }

    const alreadyVoted = post.pollData.voters.some((v) => v.userId.toString() === req.user._id.toString());
    if (alreadyVoted) {
      return res.status(400).json({ success: false, message: 'You have already voted in this poll.' });
    }

    if (post.pollData.options[optionIndex]) {
      post.pollData.options[optionIndex].votes += 1;
      post.pollData.voters.push({
        userId: req.user._id,
        optionIndex,
      });
      await post.save();
    }

    res.json({
      success: true,
      pollData: post.pollData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/upload-media
// @desc Upload photo/video with EXIF stripping
router.post('/upload-media', protect, upload.single('media'), sanitizeUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      fileUrl,
      message: 'Media uploaded and EXIF metadata safely stripped for anonymity.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/posts/:id
// @desc Update civic report details (author or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Check authorization: author or moderator/superadmin
    if (post.author.toString() !== req.user._id.toString() && !['moderator', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this report' });
    }

    const { title, content, category, constituency, state, evidenceLevel, issueStatus, resolutionProofUrl } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (constituency) post.constituency = constituency;
    if (state) post.state = state;
    if (evidenceLevel) post.evidenceLevel = evidenceLevel;
    if (issueStatus) post.issueStatus = issueStatus;
    if (resolutionProofUrl) post.resolutionProofUrl = resolutionProofUrl;

    await post.save();
    res.json({ success: true, message: 'Report updated successfully', post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/posts/:id
// @desc Delete civic report (author or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && !['moderator', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this report' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/posts/:id/representative-reply
// @desc Representative official Right of Reply & status update
router.post('/:id/representative-reply', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const { replyContent, newStatus, proofImageUrl } = req.body;
    
    // Add official response comment
    post.comments.push({
      author: req.user._id,
      authorHandle: `${req.user.fullName || req.user.handle} (Official Representative)`,
      authorRole: 'representative',
      content: replyContent,
      isOfficial: true,
      createdAt: new Date(),
    });

    if (newStatus) {
      post.issueStatus = newStatus;
    }
    if (proofImageUrl) {
      post.resolutionProofUrl = proofImageUrl;
    }

    await post.save();
    res.json({
      success: true,
      message: 'Official Right of Reply published and issue status updated.',
      post,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
