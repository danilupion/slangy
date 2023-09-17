import chalk from 'chalk';
import { Document, FilterQuery, Model } from 'mongoose';

import { createOrUpdate } from './utils.js';

export type Seed<T> = Partial<T> | (() => Promise<Partial<T>> | Partial<T>);

type SeeederOptions<DocumentType, InstancesKeyType extends string> = {
  model: Model<DocumentType>;
  items: {
    [key in InstancesKeyType]: Seed<DocumentType>;
  };
  query: (item: Partial<DocumentType>) => FilterQuery<DocumentType>;
  transform?: (item: Partial<DocumentType>) => DocumentType;
};

type SeedOptions = {
  verbose?: boolean;
};

type ClearOptions = {
  verbose?: boolean;
};

const seeder = <DocumentType extends Document, InstancesKeyType extends string>({
  model,
  items,
  query,
  transform = (item) => ({ ...item }) as DocumentType,
}: SeeederOptions<DocumentType, InstancesKeyType>) => {
  const instances = {} as { [key in InstancesKeyType]: DocumentType };

  return {
    seed: async ({ verbose = false }: SeedOptions = {}) => {
      let updated = 0;
      let created = 0;
      let failed = 0;

      for (const [key, valueOrFactory] of Object.entries(items) as [
        InstancesKeyType,
        Seed<DocumentType>,
      ][]) {
        const item = await (typeof valueOrFactory === 'function'
          ? valueOrFactory()
          : valueOrFactory);

        try {
          const [instance, isNew] = await createOrUpdate<DocumentType>(
            model,
            query(item),
            transform(item),
          );

          instances[key as InstancesKeyType] = instance;

          if (isNew) {
            created++;
            verbose &&
              console.log(chalk.green(`${chalk.bold(`[${model.modelName}:CREATED]`)} ${key}`));
          } else {
            updated++;
            verbose &&
              console.log(chalk.yellow(`${chalk.bold(`[${model.modelName}:UPDATED]`)} ${key}`));
          }
        } catch (e) {
          failed++;
          verbose &&
            console.log(
              console.log(chalk.red(`${chalk.bold(`[${model.modelName}:FAILED]`)} ${key}`), e),
            );
        }
      }

      const summary = [
        ...(created ? [chalk.green(`Created: ${created}`)] : []),
        ...(updated ? [chalk.yellow(`Updated: ${updated}`)] : []),
        ...(failed ? [chalk.red(`Failed: ${failed}`)] : []),
      ].join(' || ');

      console.log(`${chalk.bold(`[${model.modelName}:DONE]`)} ${summary}`);
    },
    clear: async ({ verbose = false }: ClearOptions = {}) => {
      const result = await model.deleteMany({});
      console.log(
        chalk.green(
          `[${model.modelName}:CLEARED] ${
            verbose ? `${result.deletedCount} records were cleared.}` : 'done'
          }`,
        ),
      );
    },
    getInstance: async (key: InstancesKeyType): Promise<DocumentType> => {
      if (!instances[key]) {
        const seedOrFactory = items[key];
        const item = (await (typeof seedOrFactory === 'function'
          ? seedOrFactory()
          : seedOrFactory)) as Partial<DocumentType>;

        const itemInDatabase = await model.findOne({
          where: query(item),
        });

        if (!itemInDatabase) {
          const [instance] = await createOrUpdate<DocumentType>(
            model,
            query(item),
            transform(item),
          );

          instances[key] = instance;
        } else {
          instances[key] = itemInDatabase;
        }
      }
      return instances[key];
    },
  };
};

export default seeder;
