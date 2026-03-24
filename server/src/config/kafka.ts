import dotenv from "dotenv";
dotenv.config();

import { Kafka, Producer, Consumer, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");
const clientId = process.env.KAFKA_CLIENT_ID || "lineup-server";
const groupId = process.env.KAFKA_GROUP_ID || "lineup-socket-emitter";

// Kafka topics
export const KAFKA_TOPICS = {
  CHAT_EVENTS: "chat.events",     // new_message, message_updated, messages_read
  CHAT_UPDATES: "chat.updates",   // chat_updated (pin, archive, etc.)
} as const;

// Event types within topics
export const KAFKA_EVENT_TYPES = {
  NEW_MESSAGE: "new_message",
  MESSAGE_UPDATED: "message_updated",
  MESSAGES_READ: "messages_read",
  CHAT_UPDATED: "chat_updated",
} as const;

const kafka = new Kafka({
  clientId,
  brokers,
  logLevel: logLevel.WARN,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const kafkaAdmin = kafka.admin();

export const kafkaProducer: Producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
});

export const kafkaConsumer: Consumer = kafka.consumer({
  groupId,
  sessionTimeout: 30000,
  heartbeatInterval: 10000,
});

export const connectKafka = async (): Promise<void> => {
  try {
    // Connect admin to create topics first
    await kafkaAdmin.connect();
    console.log("✅ Kafka admin connected");

    const existingTopics = await kafkaAdmin.listTopics();
    const topicsToCreate = [
      { topic: KAFKA_TOPICS.CHAT_EVENTS, numPartitions: 3, replicationFactor: 1 },
      { topic: KAFKA_TOPICS.CHAT_UPDATES, numPartitions: 3, replicationFactor: 1 },
    ].filter(t => !existingTopics.includes(t.topic));

    if (topicsToCreate.length > 0) {
      await kafkaAdmin.createTopics({
        topics: topicsToCreate,
      });
      console.log("✅ Kafka topics created");
    } else {
      console.log("✅ Kafka topics already exist");
    }

    await kafkaAdmin.disconnect();

    // Connect producer
    await kafkaProducer.connect();
    console.log("✅ Kafka producer connected");

    // Connect consumer
    await kafkaConsumer.connect();
    console.log("✅ Kafka consumer connected");

    // Subscribe to topics
    await kafkaConsumer.subscribe({
      topics: [KAFKA_TOPICS.CHAT_EVENTS, KAFKA_TOPICS.CHAT_UPDATES],
      fromBeginning: false,
    });
    console.log("✅ Kafka consumer subscribed to topics");
  } catch (error) {
    console.error("❌ Kafka connection failed:", error);
    throw error;
  }
};

export const disconnectKafka = async (): Promise<void> => {
  try {
    await kafkaProducer.disconnect();
    console.log("Kafka producer disconnected");
    await kafkaConsumer.disconnect();
    console.log("Kafka consumer disconnected");
  } catch (error) {
    console.error("Error disconnecting Kafka:", error);
  }
};
