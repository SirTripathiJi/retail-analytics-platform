import { createApp } from './app.js';
import { MongoClient } from 'mongodb';
import { createMongoProductStore } from './products/mongoStore.js';
import { createProductStore } from './products/store.js';

async function start() {
  const port = Number(process.env.PORT || 3001);
  let mongoClient;
  let productStore = createProductStore();

  if (process.env.MONGODB_URI) {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    const database = mongoClient.db(process.env.MONGODB_DATABASE || 'retail_analytics');
    productStore = createMongoProductStore(
      database.collection('products'),
      database.collection('sales'),
      mongoClient
    );
    await productStore.ensureIndexes();
    console.log('MongoDB product persistence enabled.');
  } else {
    console.log('MONGODB_URI is not set; using temporary in-memory product storage.');
  }

  const server = createApp({ productStore }).listen(port, '127.0.0.1', () => {
    console.log(`Retail API listening at http://127.0.0.1:${port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await mongoClient?.close();
      process.exit(0);
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

start().catch(() => {
  console.error('Could not start the retail API; check the configured database connection.');
  process.exitCode = 1;
});
