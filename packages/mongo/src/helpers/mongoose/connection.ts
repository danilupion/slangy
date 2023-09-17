import config from 'config';
import { Connection, connect, set } from 'mongoose';

let connection: Connection | undefined;

const mongodbUri =
  process.env.MONGODB_URI ||
  `mongodb://${config.get<string>('mongodb.host')}:${config.get<string>(
    'mongodb.port',
  )}/${config.get<string>('mongodb.database')}`;

interface ConnectMongooseParams {
  strictQuery?: boolean;
  debug?: boolean;
  uri?: string;
  bufferCommands?: boolean;
  autoIndex?: boolean;
}

export const connectMongoose = async ({
  strictQuery = false,
  debug,
  uri = mongodbUri,
  bufferCommands = true,
  autoIndex = true,
}: ConnectMongooseParams = {}) => {
  if (!connection) {
    set('strictQuery', strictQuery);

    connection = (
      await connect(uri, {
        bufferCommands,
        autoIndex,
      })
    ).connection;

    connection.on('connected', () => {
      console.log('Mongoose connected!');
    });

    connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    connection.on('disconnected', () => {
      console.log('Mongoose disconnected.');
    });

    set('debug', debug);
  }
};

export const disconnectMongoose = async () => {
  await connection?.close();
  connection = undefined;
};
