import mongoose from 'mongoose';

export default async () => {
  const [connection] = mongoose.connections;
  if (connection.readyState !== 1) {
    try {
      const MONGODB_URI = process.env.MONGODB_URI || '';
      if (MONGODB_URI === '') throw new Error('Missing MONGODB_URI');

      await mongoose.connect(MONGODB_URI, {
        keepAlive: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
      console.log('connected to mongodb', MONGODB_URI);
    } catch (err) {
      console.log('Failed connection to MONGO DATABASE');
      console.error(err.message);
      throw new Error(err);
    }
  }
};
