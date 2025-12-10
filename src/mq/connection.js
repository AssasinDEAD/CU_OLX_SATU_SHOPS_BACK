import amqp from "amqplib";
import { config } from "../config/env.js";

export async function connectToRabbit() {
  try {
    const conn = await amqp.connect(config.RABBITMQ_URL);
    const channel = await conn.createChannel();
    return { conn, channel };
  } catch (err) {
    console.error("⚠️ RabbitMQ connection failed:", err.message);
    throw err;
  }
}
