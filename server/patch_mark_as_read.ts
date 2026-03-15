import fs from 'fs';

const filePath = 'src/services/chat.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

const markAsReadTarget = `        await tx.chatMember.update({
          where: { chatId_userId: { chatId, userId } },
          data: { unreadCount: 0 },
        });

        return updatedMessages;`;

const markAsReadReplacement = `        await tx.chatMember.update({
          where: { chatId_userId: { chatId, userId } },
          data: { unreadCount: 0 },
        });

        // --- EMIT SOCKET EVENT ---
        try {
          if (updatedMessages.length > 0) {
            const { getIO } = await import('@/socket/index.js');
            const io = getIO();
            
            const messageIds = updatedMessages.map(m => m.id.toString());
            
            io.to(\`chat:\${chatId}\`).emit("messages_read", {
              chatId,
              messageIds,
              readByUserId: userId,
              readAt: new Date()
            });
          }
        } catch (socketErr) {
          console.error("[Socket.io] Failed to emit messages_read event:", socketErr);
        }

        return updatedMessages;`;

if (content.includes(markAsReadTarget)) {
    content = content.replace(markAsReadTarget, markAsReadReplacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully injected messages_read event into chat.service.ts!');
} else {
    console.error('Target string for markAsRead not found in chat.service.ts!');
}
