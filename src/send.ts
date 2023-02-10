import { AmqpClient, ClientConfig } from "./amqp-utils";

const client: AmqpClient = new AmqpClient();

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

// async function app() {
//   try {
//     await client.config(cfg);

//     console.time("xxx");
//     for (let i = 0; i < 10000; i++) {
//       const message = "hello bob : " + i;
//       const result = await client.send("bob", Buffer.from(message));
//     }
//     console.timeEnd("xxx");
//   } finally {
//     await client.close();
//   }
// }

// app();

// (async () => {
//   try {
//     await client.config(cfg);

//     console.time("xxx");
//     for (let i = 0; i < 10000; i++) {
//       const message = "hello bob : " + i;
//       const result = await client.send("bob", Buffer.from(message));
//     }
//     console.timeEnd("xxx");
//   } finally {
//     await client.close();
//   }
// })();

// setTimeout(() => {
//   console.log("app exit!");
// }, 10000);

// import * as amqp from 'amqplib';

// const queue = 'hello';
// const text = 'Hello World!';

// (async () => {
//   let connection;
//   try {
//     connection = await amqp.connect('amqp://localhost/fe3');
//     const channel = await connection.createChannel();

//     await channel.assertQueue(queue, { durable: false, });

//     // NB: `sentToQueue` and `publish` both return a boolean
//     // indicating whether it's OK to send again straight away, or
//     // (when `false`) that you should wait for the event `'drain'`
//     // to fire before writing again. We're just doing the one write,
//     // so we'll ignore it.
//     channel.sendToQueue(queue, Buffer.from(text));
//     console.log(" [x] Sent '%s'", text);
//     await channel.close();
//   }
//   catch (err) {
//     console.warn(err);
//   }
//   finally {
//     if (connection) await connection.close();
//   };
// })();
