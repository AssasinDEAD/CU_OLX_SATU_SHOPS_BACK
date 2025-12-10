import { connectToRabbit } from "./connection.js";
import { QUEUES } from "./queues.js";

export async function publishTask(task) {
  const { channel, conn } = await connectToRabbit();
  await channel.assertQueue(QUEUES.TASKS, { durable: true });
  channel.sendToQueue(QUEUES.TASKS, Buffer.from(JSON.stringify(task)), { persistent: true });
  await channel.close();
  await conn.close();
}
