import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    result: {
      service: {
        // Creates a virtual "price" field backward-compatible with your v1 routes
        price: {
          needs: { dashboardPrice: true, apiPrice: true },
          compute(service) {
            try {
              // Read the injected header from middleware
              const origin = headers().get('x-request-origin');
              return origin === 'api' ? service.apiPrice : service.dashboardPrice;
            } catch (error) {
              // Fallback to dashboard price if read fails (e.g., cron jobs)
              return service.dashboardPrice;
            }
          },
        },
      },
      dataPlan: {
        price: {
          needs: { dashboardPrice: true, apiPrice: true },
          compute(plan) {
            try {
              const origin = headers().get('x-request-origin');
              return origin === 'api' ? plan.apiPrice : plan.dashboardPrice;
            } catch (error) {
              return plan.dashboardPrice;
            }
          },
        },
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;
