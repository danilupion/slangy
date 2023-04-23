import type { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import NodeEnvironment from 'jest-environment-node';
import { MongoMemoryServer } from 'mongodb-memory-server';

class NodeEnvironmentWithMongo extends NodeEnvironment.default {
  protected mongoServer: MongoMemoryServer | undefined;

  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
  }

  async setup() {
    await super.setup();
    this.mongoServer = await MongoMemoryServer.create();
    if (this.context) {
      this.context.process.env.MONGODB_URI = this.mongoServer.getUri('test');
    }
  }

  async teardown() {
    if (this.mongoServer) {
      await this.mongoServer.stop(true);
      this.mongoServer = undefined;
    }
    await super.teardown();
  }
}

export default NodeEnvironmentWithMongo;
