/**
 * JanAudit Real-Time WebSockets Engine (Socket.io)
 * Powers live political reactions, score tickers, and Andolan Mode ephemeral protest spaces
 */

const AndolanRoom = require('../models/AndolanRoom');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    // console.log(`⚡ Client connected: ${socket.id}`);

    // Join specific post or politician room for live updates
    socket.on('join_entity_room', (entityId) => {
      socket.join(`entity_${entityId}`);
    });

    // Real-time Reaction Broadcast
    socket.on('send_reaction', (data) => {
      const { postId, reactionType, updatedReactions } = data;
      io.emit('reaction_updated', { postId, reactionType, updatedReactions });
    });

    // Live Ticker broadcast when a politician score changes
    socket.on('score_updated', (data) => {
      io.emit('ticker_score_changed', data);
    });

    // Andolan Mode: 48-Hour Ephemeral Protest Space
    socket.on('join_andolan', async (data) => {
      const { roomCode, userHandle } = data;
      socket.join(`andolan_${roomCode}`);
      socket.andolanRoomCode = roomCode;
      socket.andolanUserHandle = userHandle || 'Anonymous Nagrik';

      try {
        const room = await AndolanRoom.findOne({ roomCode });
        if (room && room.isLive) {
          room.activeParticipants += 1;
          if (room.activeParticipants > room.peakParticipants) {
            room.peakParticipants = room.activeParticipants;
          }
          await room.save();
          io.to(`andolan_${roomCode}`).emit('andolan_user_count', {
            roomCode,
            activeCount: room.activeParticipants,
            userJoined: socket.andolanUserHandle,
          });
        }
      } catch (err) {
        console.error('Andolan join error:', err.message);
      }
    });

    socket.on('send_andolan_message', async (data) => {
      const { roomCode, senderHandle, senderKarmaTier, text, isSafetyAlert, mediaUrl } = data;
      const messagePayload = {
        senderHandle: senderHandle || 'Anonymous Nagrik',
        senderKarmaTier: senderKarmaTier || 'nagrik',
        text,
        isSafetyAlert: !!isSafetyAlert,
        mediaUrl: mediaUrl || '',
        timestamp: new Date(),
      };

      try {
        const room = await AndolanRoom.findOne({ roomCode });
        if (room && room.isLive) {
          room.messages.push(messagePayload);
          if (isSafetyAlert) {
            room.safetyAlerts.push({
              alertText: text,
              reportedBy: senderHandle,
              timestamp: new Date(),
            });
          }
          await room.save();
          io.to(`andolan_${roomCode}`).emit('new_andolan_message', messagePayload);
        }
      } catch (err) {
        console.error('Andolan message error:', err.message);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (socket.andolanRoomCode) {
        try {
          const room = await AndolanRoom.findOne({ roomCode: socket.andolanRoomCode });
          if (room && room.isLive && room.activeParticipants > 0) {
            room.activeParticipants = Math.max(0, room.activeParticipants - 1);
            await room.save();
            io.to(`andolan_${socket.andolanRoomCode}`).emit('andolan_user_count', {
              roomCode: socket.andolanRoomCode,
              activeCount: room.activeParticipants,
            });
          }
        } catch (err) {
          // ignore
        }
      }
    });
  });
}

module.exports = { setupSocketIO };
