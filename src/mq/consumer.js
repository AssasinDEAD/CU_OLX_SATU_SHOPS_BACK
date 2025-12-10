import { connectToRabbit } from "./connection.js";
import { QUEUES } from "./queues.js";
import { saveTask } from "../repositories/tasks.repo.js";

export async function startTaskConsumer() {
  const { channel } = await connectToRabbit();
  await channel.assertQueue(QUEUES.TASKS, { durable: true });
  channel.prefetch(1);

  channel.consume(QUEUES.TASKS, async (msg) => {
    if (msg !== null) {
      try {
        const task = JSON.parse(msg.content.toString());
        await saveTask(task);
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Error saving task:", err);
        channel.nack(msg, false, true);
      }
    }
  });
}
