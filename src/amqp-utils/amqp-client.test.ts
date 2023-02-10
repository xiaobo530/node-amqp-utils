import { describe, test, expect } from "@jest/globals";
import { AmqpClient, ClientConfig } from "./amqp-client";
import { range, map, lastValueFrom, last } from "rxjs";

describe("Amqp Client", () => {
  let client: AmqpClient;

  beforeEach(() => {
    client = new AmqpClient();
  });

  afterEach(async () => {
    await client.close();
  });

  test("common config", async () => {
    const result = await client.config({});
    expect(result).toBeTruthy();
    expect(client.cnn).not.toBeNull();
  });

  test("config 1 exchange", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      exchanges: [
        {
          exchange: "test.direct",
          type: "direct",
        },
      ],
    };
    const result = await client.config(cfg);
    expect(result).toBeTruthy();
    expect(client.cnn).not.toBeNull();
  });

  test("config 3 exchanges", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      exchanges: [
        {
          exchange: "test.direct",
          type: "direct",
        },
        {
          exchange: "test.topic",
          type: "topic",
        },
        {
          exchange: "test.fanout",
          type: "fanout",
        },
      ],
    };
    const result = await client.config(cfg);
    expect(result).toBeTruthy();
    expect(client.cnn).not.toBeNull();
  });

  test("config 1 queue", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      queues: [
        {
          queue: "bob",
          options: {
            durable: true,
          },
        },
      ],
    };
    const result = await client.config(cfg);
    expect(result).toBeTruthy();
    expect(client.cnn).not.toBeNull();
  });

  test("send 1 message to bob queue", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      queues: [
        {
          queue: "bob",
          options: {
            durable: true,
          },
        },
      ],
    };

    const message = "hello bob!!!";
    await client.config(cfg);
    const result = await client.send("bob", Buffer.from(message));
    expect(result).toBeTruthy();
  });

  test("send many message to bob queue", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      queues: [
        {
          queue: "bob",
          options: {
            durable: true,
          },
        },
      ],
    };

    await client.config(cfg);

    const messages = [...new Array(100).keys()].map(
      (val) => "hello bob : " + val
    );

    const result = await client.send(
      "bob",
      messages.map((val) => Buffer.from(val))
    );
    expect(result).toBeTruthy();
  });

  test.skip("send 10000x messages to bob queue", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      queues: [
        {
          queue: "bob",
          options: {
            durable: true,
          },
        },
      ],
    };

    console.time("send 10000 messages");
    await client.config(cfg);
    for (let i = 0; i < 10000; i++) {
      const message = "hello bob : " + i;
      const result = await client.send("bob", Buffer.from(message));
      expect(result).toBeTruthy();
    }
    console.timeEnd("send 10000 messages");
  });

  test("public 1 message to direct exchange", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      exchanges: [
        {
          exchange: "test.direct",
          type: "direct",
        },
      ],
      queues: [
        {
          queue: "bob.direct",
          options: {
            durable: true,
          },
          exchanges: [
            {
              bindingExchange: "test.direct",
              bindingKey: "direct",
            },
          ],
        },
      ],
    };

    const message = "hello bob!!!";
    await client.config(cfg);
    const result = await client.publish(
      "test.direct",
      "direct",
      Buffer.from(message)
    );
    expect(result).toBeTruthy();
  });

  test("public 3 to direct exchange", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      exchanges: [
        {
          exchange: "test.direct",
          type: "direct",
        },
      ],
      queues: [
        {
          queue: "bob.direct",
          options: {
            durable: true,
          },
          exchanges: [
            {
              bindingExchange: "test.direct",
              bindingKey: "direct",
            },
          ],
        },
      ],
    };

    await client.config(cfg);

    const messages = ["msg1", "msg2", "msg3"];
    const result = await client.publish(
      "test.direct",
      "direct",
      messages.map((val) => Buffer.from(val))
    );
    expect(result).toBeTruthy();
  });

  test("public 1 message to topic exchange by xxx", async () => {
    const cfg: ClientConfig = {
      url: "amqp://localhost/test",
      exchanges: [
        {
          exchange: "test.topic",
          type: "topic",
        },
      ],
      queues: [
        {
          queue: "bob.xxx",
          options: {
            durable: true,
          },
          exchanges: [
            {
              bindingExchange: "test.topic",
              bindingKey: "xxx",
            },
          ],
        },
        {
          queue: "bob.yyy",
          options: {
            durable: true,
          },
          exchanges: [
            {
              bindingExchange: "test.topic",
              bindingKey: "yyy",
            },
          ],
        },
      ],
    };

    const message = "hello bob!!!";
    await client.config(cfg);
    const result = await client.publish(
      "test.topic",
      "xxx",
      Buffer.from(message + " xxx")
    );
    expect(result).toBeTruthy();
  });
});
