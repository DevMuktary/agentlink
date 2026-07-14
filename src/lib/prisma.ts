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

          // 2. Await the headers (Next.js 16+) and apply pricing logic
          try {
            const headersList = await headers();
            const origin = headersList.get('x-request-origin');
            const isApi = origin === 'api';

            if (Array.isArray(result)) {
              result.forEach(r => {
                // Ensure the fields exist before mapping (avoids errors on select queries)
                if (r.dashboardPrice !== undefined && r.apiPrice !== undefined) {
                  r.price = isApi ? r.apiPrice : r.dashboardPrice;
                }
              });
            } else if (result.dashboardPrice !== undefined && result.apiPrice !== undefined) {
              result.price = isApi ? result.apiPrice : result.dashboardPrice;
            }
          } catch (error) {
            // Failsafe (e.g., if called via a background cron job where headers don't exist)
            // It safely defaults back to the old price or dashboardPrice
          }

          return result;
        }
      },
      dataPlan: {
        async $allOperations({ operation, args, query }) {
          // 1. Await the actual database query
          const result = await query(args);
          if (!result) return result;

          // 2. Await the headers (Next.js 16+) and apply pricing logic
          try {
            const headersList = await headers();
            const origin = headersList.get('x-request-origin');
            const isApi = origin === 'api';

            if (Array.isArray(result)) {
              result.forEach(r => {
                if (r.dashboardPrice !== undefined && r.apiPrice !== undefined) {
                  r.price = isApi ? r.apiPrice : r.dashboardPrice;
                }
              });
            } else if (result.dashboardPrice !== undefined && result.apiPrice !== undefined) {
              result.price = isApi ? result.apiPrice : result.dashboardPrice;
            }
          } catch (error) {
            // Failsafe
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
