import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    // Create some sample data
    const jetton = await prisma.jetton.create({
      data: {
        name: "Test Jetton",
        symbol: "TEST",
        image: "https://example.com/image.png",
        description: "A test jetton token",
        ownerAddress: "EQD4gS-Nj2Gjr2FYtg-s3fXUvjzKbzHGZ5_1Xe_V0-GCp0p2",
        contractAddress: "EQBYLTm7QCnqGNRB7jsNZoAHZC7w7Zk4B8CnghM3bvVxrBtN",
        totalSupply: "1000000",
        mintTransactions: {
          create: {
            recipientAddress: "EQD4gS-Nj2Gjr2FYtg-s3fXUvjzKbzHGZ5_1Xe_V0-GCp0p2",
            amount: "1000000",
            transactionHash: "97c16dc7ee90af3c5b3a531dd1f39fa4ef6f159a8f31c8bde3099fd1233125d4"
          }
        }
      }
    });

    console.log('Created sample jetton:', jetton);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();