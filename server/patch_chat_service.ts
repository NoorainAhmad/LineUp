import fs from 'fs';

const filePath = 'server/src/services/chat.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Inject into sendMessage
const sendMessageTarget = `        await tx.chatMember.updateMany({
          where: { chatId, userId: { not: senderId } },
          data: { unreadCount: { increment: createdMessages.length } },
        });
        return createdMessages;`;

const sendMessageReplacement = `        await tx.chatMember.updateMany({
          where: { chatId, userId: { not: senderId } },
          data: { unreadCount: { increment: createdMessages.length } },
        });
        
        // --- EMIT SOCKET EVENT ---
        try {
          const { getIO } = await import('@/socket/index.js');
          const io = getIO();
          
          createdMessages.forEach(msg => {
              const safeMsg = {
                  ...msg,
                  id: msg.id.toString(),
                  replyToId: msg.replyToId ? msg.replyToId.toString() : null,
              };
              io.to(\`chat:\${chatId}\`).emit("new_message", safeMsg);
          });
          
          io.to(\`chat:\${chatId}\`).emit("chat_updated", {
              chatId,
              lastMessageId: lastMessage.id.toString(),
              updatedAt: new Date()
          });
        } catch (socketErr) {
          console.error("[Socket.io] Failed to emit new_message event:", socketErr);
        }

        return createdMessages;`;

if (content.includes(sendMessageTarget)) { content = content.replace(sendMessageTarget, sendMessageReplacement); }

// 2. Inject into editMessage
const editMessageTarget = `      // Update the message
      return await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          isEdited: true,
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      });`;

const editMessageReplacement = `      // Update the message
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          isEdited: true,
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      // --- EMIT SOCKET EVENT ---
      try {
        const { getIO } = await import('@/socket/index.js');
        const io = getIO();
        const safeMsg = {
            ...updatedMessage,
            id: updatedMessage.id.toString(),
            replyToId: updatedMessage.replyToId ? updatedMessage.replyToId.toString() : null,
        };
        io.to(\`chat:\${updatedMessage.chatId}\`).emit("message_updated", safeMsg);
      } catch (socketErr) {
        console.error("[Socket.io] Failed to emit message_updated event:", socketErr);
      }

      return updatedMessage;`;

if (content.includes(editMessageTarget)) { content = content.replace(editMessageTarget, editMessageReplacement); }

// 3. Inject into toggleReaction
const toggleReactionTarget = `return prisma.message.update({
        where: { id: messageId },
        data: { reactions },
      });`;

const toggleReactionReplacement = `      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { reactions },
      });

      // --- EMIT SOCKET EVENT ---
      try {
        const { getIO } = await import('@/socket/index.js');
        const io = getIO();
        const safeMsg = {
            ...updatedMessage,
            id: updatedMessage.id.toString(),
            replyToId: updatedMessage.replyToId ? updatedMessage.replyToId.toString() : null,
        };
        io.to(\`chat:\${updatedMessage.chatId}\`).emit("message_updated", safeMsg);
      } catch (socketErr) {
        console.error("[Socket.io] Failed to emit message_updated event:", socketErr);
      }

      return updatedMessage;`;

if (content.includes(toggleReactionTarget)) { content = content.replace(toggleReactionTarget, toggleReactionReplacement); }

// 4. Inject into markAsRead
const markAsReadTarget = `    if (!chat?.lastMessageId) {
      return prisma.chatMember.update({
        where: { userId_chatId: { userId, chatId } },
        data: { unreadCount: 0 },
      });
    }

    return prisma.chatMember.update({
      where: { userId_chatId: { userId, chatId } },
      data: {
        unreadCount: 0,
        lastReadSeq: chat.lastMessageId,
        lastDeliveredSeq: chat.lastMessageId,
      },
    });`;

const markAsReadReplacement = `    if (!chat?.lastMessageId) {
      const memberUpdate = await prisma.chatMember.update({
        where: { userId_chatId: { userId, chatId } },
        data: { unreadCount: 0 },
      });

      // --- EMIT SOCKET EVENT ---
      try {
        const { getIO } = await import('@/socket/index.js');
        const io = getIO();
        io.to(\`chat:\${chatId}\`).emit("messages_read", {
          chatId,
          readByUserId: userId,
          lastReadSeq: null,
          readAt: new Date()
        });
      } catch (socketErr) {
        console.error("[Socket.io] Failed to emit messages_read event:", socketErr);
      }

      return memberUpdate;
    }

    const memberUpdate = await prisma.chatMember.update({
      where: { userId_chatId: { userId, chatId } },
      data: {
        unreadCount: 0,
        lastReadSeq: chat.lastMessageId,
        lastDeliveredSeq: chat.lastMessageId,
      },
    });

    // --- EMIT SOCKET EVENT ---
    try {
      const { getIO } = await import('@/socket/index.js');
      const io = getIO();
      io.to(\`chat:\${chatId}\`).emit("messages_read", {
        chatId,
        readByUserId: userId,
        lastReadSeq: chat.lastMessageId.toString(),
        readAt: new Date()
      });
    } catch (socketErr) {
      console.error("[Socket.io] Failed to emit messages_read event:", socketErr);
    }

    return memberUpdate;`;

if (content.includes(markAsReadTarget)) {
  content = content.replace(markAsReadTarget, markAsReadReplacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected all socket events into chat.service.ts!');
