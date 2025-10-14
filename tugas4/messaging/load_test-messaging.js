import { Writer, Connection } from 'k6/x/kafka';
import { Trend, Counter } from 'k6/metrics';
import { open } from 'k6/experimental/fs';
import { sleep } from 'k6';

const brokers = ['localhost:9092'];
const topics = ['sepuluhkb', 'seratuskb', 'satumb', 'limamb', 'sepuluhmb'];
const connection = new Connection({ address: brokers[0] });

const topicFiles = {
  sepuluhkb: 'html/10kb.html',
  seratuskb: 'html/100kb.html',
  satumb: 'html/1024kb.html',
  limamb: 'html/5120kb.html',
  sepuluhmb: 'html/10240kb.html',
};

const encodedMessages = {};
for (const [topic, path] of Object.entries(topicFiles)) {
  encodedMessages[topic] = utf8Encode(open(path));
}

const produceTime = {
  sepuluhkb: new Trend('response_time_sepuluhkb', true, { unit: 'ms' }),
  seratuskb: new Trend('response_time_seratuskb', true, { unit: 'ms' }),
  satumb: new Trend('response_time_satumb', true, { unit: 'ms' }),
  limamb: new Trend('response_time_limamb', true, { unit: 'ms' }),
  sepuluhmb: new Trend('response_time_sepuluhmb', true, { unit: 'ms' }),
};

const messagesSent = {
  sepuluhkb: new Counter('messages_sent_sepuluhkb'),
  seratuskb: new Counter('messages_sent_seratuskb'),
  satumb: new Counter('messages_sent_satumb'),
  limamb: new Counter('messages_sent_limamb'),
  sepuluhmb: new Counter('messages_sent_sepuluhmb'),
};

if (__VU === 0) {
  for (const topic of topics) {
    connection.createTopic({ topic });
  }
}

const writers = new Map();
topics.forEach((topic) => {
  writers.set(
    topic,
    new Writer({
      brokers,
      topic,
      maxMessageBytes: 15728640,
      autoCreateTopic: false,
    }),
  );
});

export const options = {
  stages: [
    { duration: '5s', target: 300 },
    { duration: '25s', target: 300 },
  ],
};


export default function () {
  const vuIndex = (__VU - 1) % topics.length;
  const topic = topics[vuIndex];
  const writer = writers.get(topic);
  const batchSize = 1;

  const message = {
    key: new utf8Encode(`key-${__VU}-${Date.now()}`),
    value: encodedMessages[topic],
  };

  const start = Date.now();
  writer.produce({ messages: [message] });
  const duration = Date.now() - start;

  produceTime[topic].add(duration);
  messagesSent[topic].add(batchSize);

  sleep(0.1 + Math.random() * 1.9);
}

function utf8Encode(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xf0 | (code >> 18));
      bytes.push(0x80 | ((code >> 12) & 0x3f));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}
