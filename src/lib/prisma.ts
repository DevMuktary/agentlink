import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      service: {
        async $allOperations({ operation, args, query }) {
          // 1. Await the actual database query
          const result = await query(args);
          if (!result) return result;

          // 2. Await headers and apply pricing logic safely
          try {
            const headersList = await headers();
            const origin = headersList.get('x-request-origin');
            const isApi = origin === 'api';

            if (Array.isArray(result)) {
              result.forEach((r: any) => {
                // Ensure it's a record object and has the price fields
                if (r && typeof r === 'object' && r.dashboardPrice !== undefined && r.apiPrice !== undefined) {
                  r.price = isApi ? r.apiPrice : r.dashboardPrice;
                }
              });
            } else if (typeof result === 'object') {
              const r = result as any;
              if (r.dashboardPrice !== undefined && r.apiPrice !== undefined) {
                r.price = isApi ? r.apiPrice : r.dashboardPrice;
              }
            }
          } catch (error) {
            // Failsafe for background jobs or missing headers
          }

          return result;
        }
      },
      dataPlan: {
        async $allOperations({ operation, args, query }) {
          // 1. Await the actual database query
          const result = await query(args);
          if (!result) return result;

          // 2. Await headers and apply pricing logic safely
          try {
            const headersList = await headers();
            const origin = headersList.get('x-request-origin');
            const isApi = origin === 'api';

            if (Array.isArray(result)) {
              result.forEach((r: any) => {
                if (r && typeof r === 'object' && r.dashboardPrice !== undefined && r.apiPrice !== undefined) {
                  r.price = isApi ? r.apiPrice : r.dashboardPrice;
                }
              });
            } else if (typeof result === 'object') {
              const r = result as any;
              if (r.dashboardPrice !== undefined && r.apiPrice !== undefined) {
                r.price = isApi ? r.apiPrice : r.dashboardPrice;
              }
            }
          } catch (error) {
            // Failsafe for background jobs or missing headers
          }

          return result;
        }
      }
    }
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
