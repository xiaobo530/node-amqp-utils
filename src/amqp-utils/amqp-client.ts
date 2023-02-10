import { Channel, connect, Connection, ConsumeMessage, Options } from "amqplib";

export interface QueueEntry {
  queue: string;
  options?: Options.AssertQueue;
  exchanges?: Array<{
    bindingExchange: string;
    bindingKey: string;
  }>;
}

export interface ExchangeEntry {
  exchange: string;
  type: "direct" | "topic" | "headers" | "fanout" | "match" | string;
  options?: Options.AssertExchange;
}

export interface ClientConfig {
  url?: string | Options.Connect;
  exchanges?: Array<ExchangeEntry>;
  queues?: Array<QueueEntry>;
}

export interface SubscribeConfig {}

export class AmqpClient {
  cnn: Connection | null = null;
  constructor() {}

  /**
   * initialize the amqp client object
   * @param cfg
   * @returns
   */
  async config(cfg: ClientConfig): Promise<boolean> {
    try {
      if (cfg.url) {
        this.cnn = await connect(cfg.url);
      } else {
        this.cnn = await connect("amqp://localhost");
      }
      const ch = await this.cnn!.createChannel();

      if (cfg.exchanges) {
        for (let entry of cfg.exchanges) {
          await ch.assertExchange(entry.exchange, entry.type, entry.options);
        }
      }

      if (cfg.queues) {
        for (let entry of cfg.queues) {
          await ch.assertQueue(entry.queue, entry.options);
          if (entry.exchanges) {
            for (let ex of entry.exchanges) {
              await ch.bindQueue(
                entry.queue,
                ex.bindingExchange,
                ex.bindingKey
              );
            }
          }
        }
      }
      await ch.close();
      return true;
    } catch (error) {
      this.cnn = null;
      return false;
    }
  }

  /**
   * close the client
   * @returns
   */
  async close(): Promise<boolean> {
    try {
      if (this.cnn) {
        await this.cnn!.close();
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * public messages to exchange
   * @param exchange
   * @param routingKey
   * @param data
   * @returns
   */
  async publish(
    exchange: string,
    routingKey: string,
    data: Buffer | Array<Buffer>
  ): Promise<boolean> {
    try {
      const ch = await this.cnn!.createChannel();
      if (Array.isArray(data)) {
        for (let d of data) {
          await ch.publish(exchange, routingKey, d);
        }
      } else {
        await ch.publish(exchange, routingKey, data); 
      }

      await ch.close();
      return true;
    } catch (error) {
      return false;
    }
  }

  async subscribe(
    queue: string,
    onMessage: (msg: ConsumeMessage | null) => void,
    consumeOptions?: Options.Consume
  ): Promise<Channel | null> {
    try {
      const ch = await this.cnn!.createChannel();
      await ch.consume(queue, onMessage, consumeOptions);
      return ch;
    } catch (error) {
      return null;
    }
  }

  /**
   * send messages to queue
   * @param queue
   * @param data
   * @returns
   */
  async send(queue: string, data: Buffer | Array<Buffer>): Promise<boolean> {
    try {
      const ch = await this.cnn!.createChannel();
      if (Array.isArray(data)) {
        for (let d of data) {
          await ch.sendToQueue(queue, d);
        }
      } else {
        await ch.sendToQueue(queue, data);
      }
      await ch.close();
      return true;
    } catch (error) {
      return false;
    }
  }
}
