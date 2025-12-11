import { connectToRabbit } from "./connection.js";
import { QUEUES } from "./queues.js";
import { pool } from "../db/pool.js";
import { saveSource } from "../repositories/source.repo.js";
import { insertTask } from "../repositories/tasks.repo.js";
import { isKeyUsed, recordKey } from "../repositories/idempotency.repo.js";

export async function startTaskConsumer() {
  const { channel } = await connectToRabbit();

  await channel.assertQueue("tasks_retry_10m", {
    durable: true,
    arguments: {
      "x-message-ttl": 10 * 60 * 1000,
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": QUEUES.TASKS
    }
  });

  await channel.assertQueue(QUEUES.TASKS, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "",
      "x-dead-letter-routing-key": "tasks_retry_10m"
    }
  });

  await channel.assertQueue("tasks_dead_final", { durable: true });

  channel.prefetch(1);

  channel.consume(QUEUES.TASKS, async (msg) => {
    if (!msg) return;

    let payload;
    try {
      payload = JSON.parse(msg.content.toString());
    } catch (err) {
      console.error("❌ Invalid JSON:", err.message);
      channel.ack(msg);
      return;
    }

    const retryCount = msg.properties.headers["x-retry-count"] || 0;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const key = payload.Id || null;

      if (key && await isKeyUsed(client, key)) {
        console.log("⚠️ Duplicate task skipped:", key);
        await client.query("ROLLBACK");
        channel.ack(msg);
        return;
      }

      const sourceId = await saveSource(payload, client);
      const taskId = await insertTask(client, payload, sourceId);

      if (key) {
        await recordKey(client, key, taskId);
      }

      await client.query("COMMIT");
      console.log("✅ Task committed:", key || taskId);
      channel.ack(msg);
    } catch (err) {
      console.error("❌ Consumer error:", err.message);
      try { await client.query("ROLLBACK"); } catch {}

      if (retryCount >= 3) {
        console.log("🚨 Max retries reached, sending to final DLQ");
        channel.sendToQueue("tasks_dead_final", msg.content, {
          headers: msg.properties.headers
        });
        channel.ack(msg);
      } else {
        channel.sendToQueue("tasks_retry_10m", msg.content, {
          headers: { ...msg.properties.headers, "x-retry-count": retryCount + 1 }
        });
        channel.ack(msg);
      }
    } finally {
      client.release();
    }
  });
}
