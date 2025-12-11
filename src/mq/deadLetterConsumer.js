import { connectToRabbit } from "./connection.js";

export async function startDeadLetterConsumer() {
  const { channel } = await connectToRabbit();

  await channel.assertQueue("tasks_dead_final", { durable: true });

  channel.prefetch(1);

  channel.consume("tasks_dead_final", async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      console.log("🛑 Dead Letter received:", payload);

      channel.ack(msg);
    } catch (err) {
      console.error("❌ Error parsing DLQ message:", err.message);
      channel.ack(msg);
    }
  });
}
