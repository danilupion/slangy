import config from 'config';
import { Connection, connect, set } from 'mongoose';

let connection: Connection | undefined;

const mongodbUri =
  process.env.MONGODB_URI ||
  `mongodb://${config.get<string>('mongodb.host')}:${config.get<string>(
    'mongodb.port',
  )}/${config.get<string>('mongodb.database')}`;

export const connectMongoose = async () => {
  if (!connection) {
    set('strictQuery', false);
    connection = (
      await connect(mongodbUri, {
        bufferCommands: true,
        autoIndex: true,
      })
    ).connection;
  }
};

export const disconnectMongoose = async () => {
  await connection?.close();
  connection = undefined;
};
