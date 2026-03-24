import { kafkaConsumer, KAFKA_EVENT_TYPES } from "../config/kafka.js";
import { getIO } from "../socket/index.js";


export async function startKafkaConsumer(): Promise<void> {
  await kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        if (!message.value) return;

        const event = JSON.parse(message.value.toString());
        const { type, payload } = event;

        const io = getIO();

        switch (type) {
          case KAFKA_EVENT_TYPES.NEW_MESSAGE: {
            const { chatId, messageData, targetUserIds } = payload;
            const chatRoom = `chat:${chatId}`;

            console.log(`[Kafka Consumer] Delivering new_message to room: ${chatRoom} and ${targetUserIds?.length || 0} user rooms`, targetUserIds);

            // Emit to the chat room (members currently viewing the chat)
            io.to(chatRoom).emit("new_message", messageData);

            // Emit to each relevant user's personal room
            // (members + supervisors who may be viewing other chats)
            for (const userId of targetUserIds) {
              io.to(userId).emit("new_message", messageData);
            }
            break;
          }

          case KAFKA_EVENT_TYPES.MESSAGE_UPDATED: {
            const { room, updateData } = payload;

            io.to(room).emit("message_updated", updateData);
            break;
          }

          case KAFKA_EVENT_TYPES.MESSAGES_READ: {
            const { room, readData } = payload;

            io.to(room).emit("messages_read", readData);
            break;
          }

          case KAFKA_EVENT_TYPES.CHAT_UPDATED: {
            const { updateData, targetRooms, targetUserIds } = payload;

            console.log(`[Kafka Consumer] Delivering chat_updated to rooms:`, targetRooms, `and user rooms:`, targetUserIds);

            // Emit to explicit rooms (e.g., chat:xyz)
            for (const room of targetRooms) {
              io.to(room).emit("chat_updated", updateData);
            }

            // Emit to personal user rooms
            for (const userId of targetUserIds) {
              io.to(userId).emit("chat_updated", updateData);
            }
            break;
          }

          default:
            console.warn(`[Kafka Consumer] Unknown event type: ${type} on topic: ${topic}`);
        }
      } catch (error) {
        console.error(
          `[Kafka Consumer] Error processing message from topic=${topic} partition=${partition}:`,
          error,
        );
      }
    },
  });

  console.log("✅ Kafka consumer started — listening for events");
}
