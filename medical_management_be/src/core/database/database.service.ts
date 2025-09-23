import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { PrismaModel } from '@/core/types/custom-prisma.type';
import {
  extendedPrismaClient,
  ExtendedPrismaClient
} from '@/utils/prisma.util';
import { Utils } from '@/utils/utils';

interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PopulateOptions {
  path: string;
  select?: string[];
}

interface QueryResult<T> {
  data: T[];
  pagination: PaginationResult;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public client: ExtendedPrismaClient;

  constructor() {
    this.client = extendedPrismaClient;
  }

  async onModuleInit(): Promise<void> {
    const maxRetries = 5;

    for (let retries = 0; retries <= maxRetries; retries++) {
      try {
        this.logger.log('Connecting to the database...');
        await this.client.$connect();
        this.logger.log('Connected to the database successfully ✨');
        break;
      } catch (error) {
        this.logger.error(
          `Failed to connect to the database. Attempt ${retries + 1} of ${maxRetries}`,
          error
        );
        if (retries >= maxRetries) {
          this.logger.error('Exceeded maximum retry attempts. Exiting...');
          process.exit(1);
        } else {
          this.logger.log(
            `Retrying to connect to the database in ${5} seconds...`
          );
          await Utils.CommonUtils.delayFunc(5000);
        }
      }
    }
  }

  /**
   * Perform an advanced query on a given Prisma model.
   *
   * This method parses the query string to extract pagination, filtering, sorting,
   * and population options. It then executes a Prisma `findMany` query on the specified
   * model with the derived options, and finally it returns the resulting data along with
   * pagination details.
   *
   * @template T The type of the data that is being queried.
   * @param {string} queryString - The query string that contains pagination, filtering, sorting, and population options.
   * @param {PrismaModel} model - The Prisma model on which the query is to be performed.
   * @param {Record<string, any>} [customizeFilter] - Optional custom filter structure to override the default.
   * @param {{path: string; select?: any}[] | PopulateOptions[]} [customizePopulate] - Optional custom population structure to override the default.
   *
   * @returns {Promise<{ data: T[]; pagination: any }>} The fetched data along with pagination details.
   */
  async advancedQuery<T>({
    queryString,
    model,
    customizeFilter,
    customizePopulate,
    userId,
    customizeProperties
  }: {
    queryString: string;
    model: PrismaModel;
    customizeFilter?: Record<string, any>;
    customizeProperties?: Record<string, any>;
    customizePopulate?: {
      path: string;
      select?: any;
    }[];
    userId?: string;
  }): Promise<{ data: T[]; pagination: any }> {
    const { pagination, filter, sort, condition, population } =
      Utils.QueryUtils.resolveQueryString(queryString);
    const queryFilter =
      Object.keys(filter).length !== 0
        ? { [condition]: [JSON.parse(JSON.stringify(filter))] }
        : {};

    const keySort = sort
      ? {
          orderBy: [
            ...Object.entries(sort).map(([key, value]) => ({
              [key]: value === 1 ? 'asc' : 'desc'
            })),
            {
              createdAt: 'desc' // Fallback sắp xếp theo createdAt
            }
          ]
        }
      : {
          orderBy: [
            {
              createdAt: 'desc' // Mặc định nếu không có sort
            }
          ]
        };

    // let mergePopulation = []
    const mergePopulation = [
      ...(population || []),
      ...(customizePopulate || [])
    ];
    const populate = mergePopulation.reduce(
      (acc: object, curr: any) => ({
        ...acc,
        [curr.path.trim()]: curr.select ? curr.select : true
      }),
      {}
    );

    const result = await (this.client[model] as any).findMany({
      take: pagination.limit,
      skip: pagination.skip,
      where: {
        ...queryFilter,
        ...customizeFilter,
        userId: userId ?? undefined,
        deletedBy: null
      },
      include: populate,
      ...keySort,
      ...customizeProperties
    });
    const count = await (this.client[model] as any).count({
      where: {
        ...queryFilter,
        ...customizeFilter,
        userId: userId ?? undefined,
        deletedBy: null
      }
    });
    return {
      data: result,
      pagination: {
        totalPage: Math.ceil(count / pagination.limit),
        ...pagination
      }
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }

  updatedBy(user: { id: string; email: string }) {
    return {
      updatedByUser: {
        connect: {
          id: user.id
        }
      },
      updatedAt: new Date()
    };
  }

  createdBy(user: { id: string; email: string }) {
    return {
      createdByUser: {
        connect: {
          id: user.id
        }
      },
      createdAt: new Date()
    };
  }

  deletedBy(user: { id: string; email: string }) {
    return {
      deletedByUser: {
        connect: {
          id: user.id
        }
      },
      deletedAt: new Date()
    };
  }
}
