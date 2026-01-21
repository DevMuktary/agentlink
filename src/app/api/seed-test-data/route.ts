import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    // 1. Find the User (We use the API Key you provided to find the user)
    // If this key belongs to a user, we use that user's ID.
    // Ensure this API key matches a real user in your DB, or we fallback to the first user found.
    const TEST_API_KEY = 'sk_live_c0b48e9a80d0b59e468953add915a63b12a0afad7403fed3';
    
    let user = await prisma.user.findFirst({
        where: { apiKeySecret: TEST_API_KEY }
    });

    // Fallback: If no user has that key, just pick the first user (for testing)
    if (!user) {
        user = await prisma.user.findFirst();
    }

    if (!user) {
        return NextResponse.json({ error: 'No users found in DB. Register a user first.' }, { status: 400 });
    }

    const TEST_IMAGE = "https://res.cloudinary.com/dkwdbjwm9/raw/upload/v1768932094/attestations/IMG-20260120-WA0221.jpeg";

    // 2. Create Dummy Requests directly in DB
    // We create one of each type so you can test every Admin Page.

    const requests = await prisma.$transaction([
        
        // A. CAC REGISTRATION (Processing)
        prisma.serviceRequest.create({
            data: {
                userId: user.id,
                serviceType: 'CAC_REGISTRATION',
                status: 'PROCESSING',
                cost: 15000,
                requestData: {
                    clientReference: `REF-CAC-${Date.now()}`,
                    business_details: {
                        proposed_name_1: "QUADROX TECH GLOBAL",
                        proposed_name_2: "QUADROX INNOVATIONS LTD",
                        nature_of_business: "Information Technology",
                        description: "Software development and cloud services.",
                        address: "123 Tech Hub, Lagos",
                        state: "Lagos",
                        lga: "Ikeja"
                    },
                    proprietor_details: {
                        firstname: "Mukhtar",
                        surname: "Abdulwaheed",
                        phone: "08012345678",
                        email: "test@quadrox.com",
                        nin: "12345678901"
                    },
                    documents: {
                        passport_url: TEST_IMAGE,
                        signature_url: TEST_IMAGE,
                        nin_slip_url: TEST_IMAGE
                    }
                },
                adminNote: 'Seeded via Test Script'
            }
        }),

        // B. BVN ENROLLMENT (Processing)
        prisma.serviceRequest.create({
            data: {
                userId: user.id,
                serviceType: 'ANDROID_BVN_ENROLLMENT',
                status: 'PROCESSING',
                cost: 3000,
                requestData: {
                    clientReference: `REF-BVN-${Date.now()}`,
                    first_name: "Amina",
                    last_name: "Yusuf",
                    bvn: "22233344455",
                    phone_number: "07098765432",
                    passportUrl: TEST_IMAGE,
                    signatureUrl: TEST_IMAGE
                },
                adminNote: 'Seeded via Test Script'
            }
        }),

        // C. NIN MODIFICATION (Processing)
        prisma.serviceRequest.create({
            data: {
                userId: user.id,
                serviceType: 'NIN_MODIFICATION_NAME',
                status: 'PROCESSING',
                cost: 4500,
                requestData: {
                    clientReference: `REF-NINMOD-${Date.now()}`,
                    service_code: 501,
                    nin: "99887766554",
                    phone_number: "08122233344",
                    new_details: {
                        first_name: "Fatima",
                        surname: "Bello"
                    },
                    documentUrl: TEST_IMAGE
                },
                adminNote: 'Seeded via Test Script'
            }
        }),

        // D. JAMB RESULT (Processing)
        prisma.serviceRequest.create({
            data: {
                userId: user.id,
                serviceType: 'JAMB_ORIGINAL_RESULT',
                status: 'PROCESSING',
                cost: 2500,
                requestData: {
                    clientReference: `REF-JAMB-${Date.now()}`,
                    service_type: "JAMB_ORIGINAL_RESULT",
                    full_name: "Emeka Okonkwo",
                    reg_number: "2025998877AB",
                    year: "2025"
                },
                adminNote: 'Seeded via Test Script'
            }
        })
    ]);

    return NextResponse.json({
        success: true,
        message: `Successfully seeded ${requests.length} requests for user: ${user.email}`,
        data: requests
    });

  } catch (error) {
    console.error("Seeding Error:", error);
    return NextResponse.json({ error: 'Failed to seed data', details: String(error) }, { status: 500 });
  }
}
