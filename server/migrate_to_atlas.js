import mongoose from 'mongoose';

const localUri = 'mongodb://127.0.0.1:27017/ammardev_crm';
const atlasUri = 'mongodb+srv://mammar:ammar@cluster0.6opyw5w.mongodb.net/ammardev_crm?retryWrites=true&w=majority';

async function migrate() {
  console.log('[Migration] Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('[Migration] Local MongoDB connected.');

  console.log('[Migration] Connecting to MongoDB Atlas Cloud...');
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log('[Migration] MongoDB Atlas Cloud connected.');

  const collections = ['users', 'brandprofiles', 'articles', 'deals', 'influencers', 'prbudgets'];

  for (const collName of collections) {
    const localDocs = await localConn.db.collection(collName).find({}).toArray();
    console.log(`[Migration] Found ${localDocs.length} documents in local ${collName}`);

    if (localDocs.length > 0) {
      await atlasConn.db.collection(collName).deleteMany({});
      await atlasConn.db.collection(collName).insertMany(localDocs);
      console.log(`[Migration] Successfully copied ${localDocs.length} documents to Atlas ${collName}`);
    }
  }

  console.log('[Migration] ALL DATA MIGRATED TO ATLAS SUCCESSFULLY!');
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});
