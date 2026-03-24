import { kafkaProducer, KAFKA_TOPICS, KAFKA_EVENT_TYPES } from "../config/kafka.js";

/**
 * KafkaEventService — publishes chat events to Kafka topics.
 * Replaces direct `getIO().emit()` calls in service code.
 *
 * The Kafka consumer (workers/kafka.consumer.ts) reads these events
 * and performs the actual Socket.io emission.
 */
export class KafkaEventService {

  //Publish a new message event.
  //Used by: sendMessage, forwardMessage

  static async publishNewMessage(data: {
    chatId: string;
    messageData: any;
    targetRooms: string[];       // chat room + personal user rooms
    targetUserIds: string[];     // pre-computed list of all relevant user IDs
  }): Promise<void> {
    await this.publish(KAFKA_TOPICS.CHAT_EVENTS, data.chatId, {
      type: KAFKA_EVENT_TYPES.NEW_MESSAGE,
      payload: data,
    });
  }


  //Publish a message updated event (edit, reaction, delete).
  //Used by: editMessage, toggleReaction, deleteMessage

  static async publishMessageUpdated(data: {
    chatId: string;
    room: string;
    updateData: any;
  }): Promise<void> {
    await this.publish(KAFKA_TOPICS.CHAT_EVENTS, data.chatId, {
      type: KAFKA_EVENT_TYPES.MESSAGE_UPDATED,
      payload: data,
    });
  }


  // Publish a messages-read event.
  //Used by: markAsRead

  static async publishMessagesRead(data: {
    chatId: string;
    room: string;
    readData: {
      chatId: string;
      userId: string;
      lastReadSeq: string | null;
    };
  }): Promise<void> {
    await this.publish(KAFKA_TOPICS.CHAT_EVENTS, data.chatId, {
      type: KAFKA_EVENT_TYPES.MESSAGES_READ,
      payload: data,
    });
  }


  //  Publish a chat updated event (new message, pin, archive, etc.).
  // Used by: sendMessage, forwardMessage, toggleArchive, pinChat

  static async publishChatUpdated(data: {
    chatId: string;
    updateData: any;
    targetRooms: string[];       // rooms to emit to
    targetUserIds: string[];     // pre-computed user IDs for personal rooms
  }): Promise<void> {
    await this.publish(KAFKA_TOPICS.CHAT_UPDATES, data.chatId, {
      type: KAFKA_EVENT_TYPES.CHAT_UPDATED,
      payload: data,
    });
  }


  // Core publish method — sends a message to a Kafka topic with chatId as partition key.
  // Using chatId as the key ensures all events for the same chat are ordered.

  private static async publish(
    topic: string,
    key: string,
    value: { type: string; payload: any },
  ): Promise<void> {
    try {
      await kafkaProducer.send({
        topic,
        messages: [
          {
            key,
            value: JSON.stringify(value),
            timestamp: Date.now().toString(),
          },
        ],
      });
    } catch (error) {
      console.error(`[Kafka Publish Error] topic=${topic} key=${key}:`, error);
      // Fallback: if Kafka publish fails, we don't want to silently lose events.
      // Log the error but DON'T throw — the message was already saved to DB,
      // and the client can recover via polling or reconnect.
    }
  }
}
