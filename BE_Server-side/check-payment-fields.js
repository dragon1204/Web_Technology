// Script để kiểm tra payment fields trong database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPaymentFields() {
  try {
    // Thử query một order với payment fields
    const order = await prisma.order.findFirst({
      select: {
        id: true,
        orderNumber: true,
        paymentId: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentLink: true,
        paymentQrCode: true,
        paidAt: true,
      },
    });

    console.log('✅ Payment fields có thể query được!');
    console.log('Sample order:', order);
    
    // Kiểm tra schema
    const orderSchema = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Order' 
      AND column_name IN ('paymentId', 'paymentStatus', 'paymentMethod', 'paymentLink', 'paymentQrCode', 'paidAt')
      ORDER BY column_name;
    `;
    
    console.log('\n📋 Payment fields trong database:');
    console.table(orderSchema);
    
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra payment fields:', error.message);
    if (error.message.includes('Unknown arg') || error.message.includes('does not exist')) {
      console.error('\n⚠️  Payment fields chưa có trong database!');
      console.error('Chạy: npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentFields();
