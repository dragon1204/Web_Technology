import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...\n');

  // Xóa dữ liệu cũ (theo thứ tự để tránh lỗi foreign key)
  console.log('🗑️  Xóa dữ liệu cũ...');
  try {
    // Xóa theo thứ tự: child tables trước, parent tables sau
    await prisma.alert.deleteMany().catch(() => {});
    await prisma.alertRule.deleteMany().catch(() => {});
    await prisma.notification.deleteMany().catch(() => {});
    await prisma.priceHistory.deleteMany().catch(() => {});
    // Đơn hàng & giỏ hàng (liên quan chặt đến ShopProduct/Garden)
    await prisma.orderItem.deleteMany().catch(() => {});
    await prisma.order.deleteMany().catch(() => {});
    await prisma.cartItem.deleteMany().catch(() => {});
    await prisma.cart.deleteMany().catch(() => {});
    await prisma.shopProduct.deleteMany().catch(() => {});
    await prisma.shop.deleteMany().catch(() => {});
    await prisma.shippingAddress.deleteMany().catch(() => {});
    await prisma.sensorData.deleteMany().catch(() => {});
    await prisma.sale.deleteMany().catch(() => {});
    await prisma.vegetableGarden.deleteMany().catch(() => {});
    await prisma.sensorData.deleteMany().catch(() => {});
    await prisma.device.deleteMany().catch(() => {});
    await prisma.garden.deleteMany().catch(() => {});
    await prisma.vegetable.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    await prisma.reportTemplate.deleteMany().catch(() => {});
    console.log('✅ Đã xóa dữ liệu cũ\n');
  } catch (error) {
    console.log('⚠️  Một số bảng có thể chưa tồn tại, tiếp tục...\n');
  }

  // Hash password mặc định
  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Tạo Users (sử dụng upsert để tránh lỗi duplicate)
  console.log('👤 Tạo users...');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: defaultPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@example.com',
      password: defaultPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {
      password: defaultPassword,
      name: 'Nguyễn Văn A',
      role: Role.USER,
    },
    create: {
      email: 'user1@example.com',
      password: defaultPassword,
      name: 'Nguyễn Văn A',
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {
      password: defaultPassword,
      name: 'Trần Thị B',
      role: Role.USER,
    },
    create: {
      email: 'user2@example.com',
      password: defaultPassword,
      name: 'Trần Thị B',
      role: Role.USER,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {
      password: defaultPassword,
      name: 'Lê Văn C',
      role: Role.CUSTOMER,
    },
    create: {
      email: 'customer1@example.com',
      password: defaultPassword,
      name: 'Lê Văn C',
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {
      password: defaultPassword,
      name: 'Phạm Thị D',
      role: Role.CUSTOMER,
    },
    create: {
      email: 'customer2@example.com',
      password: defaultPassword,
      name: 'Phạm Thị D',
      role: Role.CUSTOMER,
    },
  });
  console.log(`✅ Đã tạo/cập nhật ${5} users\n`);

  // 2. Sensor Types đã được thay thế bằng Device model - bỏ qua phần này

  // 3. Tạo Gardens (xóa và tạo lại)
  console.log('🏡 Tạo gardens...');
  await prisma.garden.deleteMany({});
  
  const garden1 = await prisma.garden.create({
    data: {
      name: 'Vườn Rau Cải Xanh',
      ownerId: user1.id,
    },
  });

  const garden2 = await prisma.garden.create({
    data: {
      name: 'Vườn Rau Sạch',
      ownerId: user1.id,
    },
  });

  const garden3 = await prisma.garden.create({
    data: {
      name: 'Vườn Rau Hữu Cơ',
      ownerId: user2.id,
    },
  });
  console.log(`✅ Đã tạo ${3} gardens\n`);

  // 4. Tạo Vegetables (xóa và tạo lại)
  console.log('🥬 Tạo vegetables...');
  await prisma.vegetable.deleteMany({});
  
  const rauCai = await prisma.vegetable.create({
    data: {
      name: 'Rau Cải Xanh',
      imported: 200,
      sold: 50,
      price: 30000,
      category: 'leafy',
      description: 'Rau cải xanh tươi ngon',
    },
  });

  const caRot = await prisma.vegetable.create({
    data: {
      name: 'Cà Rốt',
      imported: 150,
      sold: 40,
      price: 25000,
      category: 'root',
      description: 'Cà rốt tươi, giàu vitamin A',
    },
  });

  const rauMuong = await prisma.vegetable.create({
    data: {
      name: 'Rau Muống',
      imported: 180,
      sold: 60,
      price: 20000,
      category: 'leafy',
      description: 'Rau muống sạch, không thuốc trừ sâu',
    },
  });

  const caChua = await prisma.vegetable.create({
    data: {
      name: 'Cà Chua',
      imported: 120,
      sold: 30,
      price: 35000,
      category: 'fruit',
      description: 'Cà chua chín đỏ, ngọt',
    },
  });

  const rauThom = await prisma.vegetable.create({
    data: {
      name: 'Rau Thơm',
      imported: 80,
      sold: 20,
      price: 40000,
      category: 'herb',
      description: 'Rau thơm các loại',
    },
  });
  console.log(`✅ Đã tạo ${5} vegetables\n`);

  // 5. Tạo Vegetable_Garden (Rau trong vườn)
  console.log('🌿 Gán rau vào vườn...');
  await prisma.vegetableGarden.createMany({
    data: [
      { vegetableId: rauCai.id, gardenId: garden1.id, quantity: 100 },
      { vegetableId: caRot.id, gardenId: garden1.id, quantity: 80 },
      { vegetableId: rauMuong.id, gardenId: garden2.id, quantity: 120 },
      { vegetableId: caChua.id, gardenId: garden2.id, quantity: 90 },
      { vegetableId: rauThom.id, gardenId: garden3.id, quantity: 60 },
      { vegetableId: rauCai.id, gardenId: garden3.id, quantity: 50 },
    ],
  });
  console.log(`✅ Đã gán rau vào vườn\n`);

  // 6. Tạo Devices và Sensor Data (sử dụng Device model mới)
  console.log('📊 Tạo devices và sensor data...');
  const now = new Date();
  
  // Tạo device mẫu cho mỗi garden
  const device1 = await prisma.device.upsert({
    where: { deviceMac: 'AA:BB:CC:DD:EE:01' },
    update: {},
    create: {
      deviceMac: 'AA:BB:CC:DD:EE:01',
      model: 'ESP32_GENERIC',
      name: 'Device_Garden1',
    },
  });

  const device2 = await prisma.device.upsert({
    where: { deviceMac: 'AA:BB:CC:DD:EE:02' },
    update: {},
    create: {
      deviceMac: 'AA:BB:CC:DD:EE:02',
      model: 'ESP32_GENERIC',
      name: 'Device_Garden2',
    },
  });

  const device3 = await prisma.device.upsert({
    where: { deviceMac: 'AA:BB:CC:DD:EE:03' },
    update: {},
    create: {
      deviceMac: 'AA:BB:CC:DD:EE:03',
      model: 'ESP32_GENERIC',
      name: 'Device_Garden3',
    },
  });

  // Gán device vào garden
  await prisma.garden.update({
    where: { id: garden1.id },
    data: { deviceMac: device1.deviceMac },
  });

  await prisma.garden.update({
    where: { id: garden2.id },
    data: { deviceMac: device2.deviceMac },
  });

  await prisma.garden.update({
    where: { id: garden3.id },
    data: { deviceMac: device3.deviceMac },
  });

  // Tạo sensor data mẫu cho device1 (30 ngày qua)
  const sensorDataPromises: Promise<any>[] = [];
  for (let day = 0; day < 30; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);

      const temperature = 20 + Math.random() * 15 + Math.sin(hour / 24 * Math.PI * 2) * 5;
      const humidity = 40 + Math.random() * 40 + Math.sin(hour / 24 * Math.PI * 2) * 10;
      const soil = 30 + Math.random() * 40;

      sensorDataPromises.push(
        prisma.sensorData.create({
          data: {
            deviceMac: device1.deviceMac,
            temperature: parseFloat(temperature.toFixed(2)),
            humidity: parseFloat(humidity.toFixed(2)),
            soil: parseFloat(soil.toFixed(2)),
            timestamp,
          },
        }),
      );
    }
  }

  await Promise.all(sensorDataPromises);
  console.log(`✅ Đã tạo ${sensorDataPromises.length} sensor data records\n`);

  // 8. Tạo Sales (giao dịch bán hàng) - Tăng số lượng để có dữ liệu revenue phong phú
  console.log('💰 Tạo sales...');
  await prisma.sale.deleteMany({});
  const salesData: any[] = [];
  
  // Tạo sales trong 90 ngày qua để có dữ liệu theo ngày/tuần/tháng
  for (let i = 0; i < 300; i++) {
    const daysAgo = Math.floor(Math.random() * 90); // 90 ngày qua
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    saleDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

    const vegetables = [rauCai, caRot, rauMuong, caChua, rauThom];
    const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    const gardens = [garden1, garden2, garden3];
    const garden = gardens[Math.floor(Math.random() * gardens.length)];

    // Số lượng từ 1-50 kg
    const quantity = Math.floor(Math.random() * 50) + 1;
    // Giá dao động từ 80% đến 120% giá gốc (VND)
    const priceAtSale = Math.round(vegetable.price * (0.8 + Math.random() * 0.4));
    const total = quantity * priceAtSale;

    salesData.push({
      vegetableId: vegetable.id,
      gardenId: garden.id,
      quantity,
      priceAtSale: priceAtSale, // VND - số nguyên
      total: total, // VND - số nguyên
      time: saleDate,
    });
  }

  await prisma.sale.createMany({ data: salesData });
  console.log(`✅ Đã tạo ${salesData.length} sales records (90 ngày qua)\n`);

  // 9. Tạo Price History
  console.log('📊 Tạo price history...');
  const priceHistoryPromises: Promise<any>[] = [];
  for (const vegetable of [rauCai, caRot, rauMuong, caChua, rauThom]) {
    for (let i = 0; i < 5; i++) {
      const changeDate = new Date(now);
      changeDate.setDate(changeDate.getDate() - (i * 7)); // Mỗi tuần 1 lần thay đổi giá

      const priceChange = vegetable.price * (0.8 + Math.random() * 0.4); // Giá dao động ±20%

      priceHistoryPromises.push(
        prisma.priceHistory.create({
          data: {
            vegetableId: vegetable.id,
            price: parseFloat(priceChange.toFixed(2)),
            changedAt: changeDate,
            changedBy: admin.id,
          },
        }),
      );
    }
  }
  await Promise.all(priceHistoryPromises);
  console.log(`✅ Đã tạo price history\n`);

  // 10. Tạo Alert Rules
  console.log('⚠️  Tạo alert rules...');
  const alertRule1 = await prisma.alertRule.create({
    data: {
      gardenId: garden1.id,
      sensorType: 'temperature',
      minValue: 15,
      maxValue: 35,
      alertOnMin: true,
      alertOnMax: true,
      severity: 'warning',
      isActive: true,
    },
  });

  const alertRule2 = await prisma.alertRule.create({
    data: {
      gardenId: garden1.id,
      sensorType: 'humidity',
      minValue: 30,
      maxValue: 80,
      alertOnMin: true,
      alertOnMax: true,
      severity: 'info',
      isActive: true,
    },
  });

  const alertRule3 = await prisma.alertRule.create({
    data: {
      gardenId: garden2.id,
      sensorType: 'temperature',
      minValue: 18,
      maxValue: 32,
      alertOnMin: true,
      alertOnMax: true,
      severity: 'critical',
      isActive: true,
    },
  });
  console.log(`✅ Đã tạo ${3} alert rules\n`);

  // 11. Tạo một số Alerts (để test)
  console.log('🚨 Tạo alerts...');
  await prisma.alert.createMany({
    data: [
      {
        ruleId: alertRule1.id,
        value: 36.5,
        message: 'Nhiệt độ vượt ngưỡng tối đa: 36.5°C',
        severity: 'warning',
        isResolved: false,
      },
      {
        ruleId: alertRule2.id,
        value: 25.0,
        message: 'Độ ẩm thấp hơn ngưỡng tối thiểu: 25%',
        severity: 'info',
        isResolved: true,
        resolvedAt: new Date(),
      },
    ],
  });
  console.log(`✅ Đã tạo alerts\n`);

  // 12. Tạo Notifications
  console.log('🔔 Tạo notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Chào mừng đến với hệ thống!',
        message: 'Cảm ơn bạn đã sử dụng Smart Garden Management System',
        type: 'info',
        isRead: false,
      },
      {
        userId: user1.id,
        title: 'Cảnh báo nhiệt độ',
        message: 'Nhiệt độ trong vườn đã vượt ngưỡng cho phép',
        type: 'alert',
        isRead: false,
      },
      {
        userId: user1.id,
        title: 'Bán hàng thành công',
        message: 'Bạn đã bán được 10kg rau cải',
        type: 'success',
        isRead: true,
      },
      {
        userId: user2.id,
        title: 'Thông báo hệ thống',
        message: 'Hệ thống sẽ bảo trì vào ngày mai',
        type: 'warning',
        isRead: false,
      },
    ],
  });
  console.log(`✅ Đã tạo notifications\n`);

  // 13. Tạo Report Template
  console.log('📋 Tạo report templates...');
  await prisma.reportTemplate.createMany({
    data: [
      {
        name: 'Báo cáo doanh thu hàng tháng',
        description: 'Báo cáo doanh thu theo tháng cho tất cả vườn',
        type: 'revenue',
        config: {
          period: 'month',
          filters: {},
        },
        userId: admin.id,
        isPublic: true,
      },
      {
        name: 'Báo cáo năng suất theo category',
        description: 'Phân tích năng suất theo loại rau',
        type: 'productivity',
        config: {
          period: 'month',
          filters: {},
        },
        userId: user1.id,
        isPublic: false,
      },
    ],
  });
  console.log(`✅ Đã tạo report templates\n`);

  // 14. Tạo Shops (mỗi user chỉ có 1 shop)
  console.log('🏪 Tạo shops...');
  await prisma.shop.deleteMany({});
  
  const shop1 = await prisma.shop.create({
    data: {
      name: 'Cửa hàng Rau Sạch ABC',
      description: 'Chuyên cung cấp rau sạch, an toàn từ vườn. Rau được trồng tại vườn nhà, không sử dụng thuốc trừ sâu.',
      ownerId: user1.id,
      isActive: true,
    },
  });

  const shop2 = await prisma.shop.create({
    data: {
      name: 'Rau Hữu Cơ Xanh',
      description: 'Rau hữu cơ 100%, không thuốc trừ sâu, không phân hóa học. Cam kết chất lượng tốt nhất.',
      ownerId: user2.id,
      isActive: true,
    },
  });
  console.log(`✅ Đã tạo ${2} shops (mỗi user 1 shop)\n`);

  // 15. Tạo Shop Products
  console.log('🛒 Tạo shop products...');
  await prisma.shopProduct.deleteMany({});
  
  // Shop 1 của user1 - có một số sản phẩm, một số chưa có (để test available-vegetables API)
  // Chỉ thêm một số rau vào shop, để lại một số rau chưa thêm (từ garden1 và garden2)
  await prisma.shopProduct.createMany({
    data: [
      // Sản phẩm có sẵn
      {
        shopId: shop1.id,
        vegetableId: rauCai.id,
        gardenId: garden1.id,
        price: 35000,
        stock: 50,
        isAvailable: true,
      },
      {
        shopId: shop1.id,
        vegetableId: caRot.id,
        gardenId: garden1.id,
        price: 28000,
        stock: 40,
        isAvailable: true,
      },
      // Sản phẩm hết hàng (stock = 0)
      {
        shopId: shop1.id,
        vegetableId: rauMuong.id,
        gardenId: garden2.id,
        price: 22000,
        stock: 0,
        isAvailable: false,
      },
      // Sản phẩm tạm ngưng bán
      {
        shopId: shop1.id,
        vegetableId: caChua.id,
        gardenId: garden2.id,
        price: 40000,
        stock: 20,
        isAvailable: false,
      },
      // Lưu ý: Rau Thơm từ garden2 chưa được thêm vào shop1 để test available-vegetables API
    ],
  });

  // Shop 2 của user2 - có một số sản phẩm từ garden3
  await prisma.shopProduct.createMany({
    data: [
      {
        shopId: shop2.id,
        vegetableId: rauThom.id,
        gardenId: garden3.id,
        price: 48000,
        stock: 25,
        isAvailable: true,
      },
      {
        shopId: shop2.id,
        vegetableId: rauCai.id,
        gardenId: garden3.id,
        price: 38000,
        stock: 35,
        isAvailable: true,
      },
      // Lưu ý: Cà Rốt từ garden3 chưa được thêm vào shop2 để test available-vegetables API
    ],
  });
  
  console.log(`✅ Đã tạo shop products\n`);
  console.log(`   📊 Tổng quan:`);
  console.log(`   - Shop 1 (user1): ${4} sản phẩm (2 có sẵn, 2 không có sẵn)`);
  console.log(`     + Còn rau chưa thêm: Rau Thơm (garden2) - để test available-vegetables API`);
  console.log(`   - Shop 2 (user2): ${2} sản phẩm (tất cả có sẵn)`);
  console.log(`     + Còn rau chưa thêm: Cà Rốt (garden3) - để test available-vegetables API\n`);

  // 16. Tạo Shipping Addresses cho customers
  console.log('📍 Tạo shipping addresses...');
  await prisma.shippingAddress.deleteMany({});
  
  await prisma.shippingAddress.createMany({
    data: [
      {
        userId: customer1.id,
        fullName: 'Lê Văn C',
        phone: '0901234567',
        address: '123 Đường ABC',
        ward: 'Phường 1',
        district: 'Quận 1',
        city: 'Hồ Chí Minh',
        isDefault: true,
      },
      {
        userId: customer2.id,
        fullName: 'Phạm Thị D',
        phone: '0987654321',
        address: '456 Đường XYZ',
        ward: 'Phường 2',
        district: 'Quận 3',
        city: 'Hồ Chí Minh',
        isDefault: true,
      },
    ],
  });
  console.log(`✅ Đã tạo shipping addresses\n`);

  // 17. Tạo Orders và OrderItems để có revenue từ shop (đơn vị: VND)
  console.log('🛒 Tạo orders và order items...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  
  // Lấy shop products để tạo orders
  const shop1Products = await prisma.shopProduct.findMany({
    where: { shopId: shop1.id, isAvailable: true },
    include: { vegetable: true },
  });
  
  const shop2Products = await prisma.shopProduct.findMany({
    where: { shopId: shop2.id, isAvailable: true },
    include: { vegetable: true },
  });

  const customer1Address = await prisma.shippingAddress.findFirst({
    where: { userId: customer1.id },
  });
  
  const customer2Address = await prisma.shippingAddress.findFirst({
    where: { userId: customer2.id },
  });

  const ordersData: any[] = [];
  let orderCounter = 1;

  // Tạo orders cho shop1 (150 orders trong 60 ngày qua)
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

    const customer = Math.random() > 0.5 ? customer1 : customer2;
    const address = customer.id === customer1.id ? customer1Address : customer2Address;
    
    if (!address) continue;

    // Random 1-3 sản phẩm mỗi đơn
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = shop1Products
      .sort(() => Math.random() - 0.5)
      .slice(0, numItems);

    let subtotal = 0;
    const orderItems: any[] = [];

    selectedProducts.forEach((product) => {
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = product.price; // Giá tại shop (VND)
      const itemSubtotal = quantity * price;
      subtotal += itemSubtotal;

      orderItems.push({
        shopProductId: product.id,
        quantity,
        price: price, // VND
        subtotal: itemSubtotal, // VND
      });
    });

    const shippingFee = Math.random() > 0.3 ? 20000 : 30000; // Phí ship 20k hoặc 30k VND
    const total = subtotal + shippingFee;

    // 80% orders đã thanh toán, 20% còn pending
    const isPaid = Math.random() > 0.2;
    const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${String(orderCounter++).padStart(4, '0')}`;

    ordersData.push({
      orderNumber,
      customerId: customer.id,
      shopId: shop1.id,
      shippingAddressId: address.id,
      status: isPaid ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
      paymentStatus: isPaid ? 'PAID' : 'PENDING',
      paymentMethod: isPaid ? 'PAYOS' : null,
      subtotal: subtotal, // VND
      shippingFee: shippingFee, // VND
      total: total, // VND
      paidAt: isPaid ? orderDate : null,
      createdAt: orderDate,
      updatedAt: orderDate,
      items: orderItems,
    });
  }

  // Tạo orders cho shop2 (100 orders trong 60 ngày qua)
  for (let i = 0; i < 100; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);
    orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

    const customer = Math.random() > 0.5 ? customer1 : customer2;
    const address = customer.id === customer1.id ? customer1Address : customer2Address;
    
    if (!address) continue;

    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = shop2Products
      .sort(() => Math.random() - 0.5)
      .slice(0, numItems);

    let subtotal = 0;
    const orderItems: any[] = [];

    selectedProducts.forEach((product) => {
      const quantity = Math.floor(Math.random() * 10) + 1;
      const price = product.price;
      const itemSubtotal = quantity * price;
      subtotal += itemSubtotal;

      orderItems.push({
        shopProductId: product.id,
        quantity,
        price: price,
        subtotal: itemSubtotal,
      });
    });

    const shippingFee = Math.random() > 0.3 ? 20000 : 30000;
    const total = subtotal + shippingFee;

    const isPaid = Math.random() > 0.2;
    const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${String(orderCounter++).padStart(4, '0')}`;

    ordersData.push({
      orderNumber,
      customerId: customer.id,
      shopId: shop2.id,
      shippingAddressId: address.id,
      status: isPaid ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
      paymentStatus: isPaid ? 'PAID' : 'PENDING',
      paymentMethod: isPaid ? 'PAYOS' : null,
      subtotal: subtotal,
      shippingFee: shippingFee,
      total: total,
      paidAt: isPaid ? orderDate : null,
      createdAt: orderDate,
      updatedAt: orderDate,
      items: orderItems,
    });
  }

  // Tạo orders với items
  for (const orderData of ordersData) {
    const { items, ...orderFields } = orderData;
    const order = await prisma.order.create({
      data: orderFields,
    });

    await prisma.orderItem.createMany({
      data: items.map((item: any) => ({
        orderId: order.id,
        ...item,
      })),
    });
  }

  const paidOrdersCount = ordersData.filter((o) => o.paymentStatus === 'PAID').length;
  const totalRevenueFromOrders = ordersData
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  console.log(`✅ Đã tạo ${ordersData.length} orders`);
  console.log(`   - ${paidOrdersCount} orders đã thanh toán (PAID)`);
  console.log(`   - ${ordersData.length - paidOrdersCount} orders đang chờ thanh toán (PENDING)`);
  console.log(`   - Tổng doanh thu từ orders đã thanh toán: ${totalRevenueFromOrders.toLocaleString('vi-VN')} VND\n`);

  console.log('✨ Seed dữ liệu hoàn tất!\n');
  console.log('📝 Thông tin đăng nhập:');
  console.log('   Admin:');
  console.log('     Email: admin@example.com');
  console.log('     Password: password123');
  console.log('   User 1 (Garden Manager):');
  console.log('     Email: user1@example.com');
  console.log('     Password: password123');
  console.log('     Shops: Shop 1 (5 products), Shop 3 (0 products - để test)');
  console.log('     Gardens: Garden 1, Garden 2');
  console.log('   User 2 (Garden Manager):');
  console.log('     Email: user2@example.com');
  console.log('     Password: password123');
  console.log('     Shops: Shop 2 (4 products)');
  console.log('     Gardens: Garden 3');
  console.log('   Customer 1:');
  console.log('     Email: customer1@example.com');
  console.log('     Password: password123');
  console.log('   Customer 2:');
  console.log('     Email: customer2@example.com');
  console.log('     Password: password123\n');
  console.log('🛒 Thông tin Shop để test API:');
  console.log(`   Shop 1 (ID: ${shop1.id}): Cửa hàng Rau Sạch ABC`);
  console.log('     - Owner: user1@example.com');
  console.log('     - Products: 4 (2 available, 2 unavailable)');
  console.log('     - Còn rau chưa thêm vào shop: Rau Thơm (garden2)');
  console.log(`   Shop 2 (ID: ${shop2.id}): Rau Hữu Cơ Xanh`);
  console.log('     - Owner: user2@example.com');
  console.log('     - Products: 2 (all available)');
  console.log('     - Còn rau chưa thêm vào shop: Cà Rốt (garden3)\n');
  console.log('📚 API Endpoints để test:');
  console.log('   GET /shop/my-shops - Lấy danh sách shop của user');
  console.log('   GET /shop/:shopId/available-vegetables - Lấy rau có thể thêm (test với shop3)');
  console.log('   GET /shop/:shopId/products - Lấy danh sách sản phẩm (có filter/pagination)');
  console.log('   POST /shop/:shopId/products - Thêm sản phẩm vào shop');
  console.log('   PATCH /shop/:shopId/products/:productId - Cập nhật sản phẩm');
  console.log('   DELETE /shop/:shopId/products/:productId - Xóa sản phẩm\n');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

