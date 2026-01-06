import { PrismaClient, Role } from '@prisma/client';
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
  console.log(`✅ Đã tạo/cập nhật ${3} users\n`);

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

  // 8. Tạo Sales (giao dịch bán hàng)
  console.log('💰 Tạo sales...');
  const salesData: any[] = [];
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - daysAgo);
    saleDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

    const vegetables = [rauCai, caRot, rauMuong, caChua, rauThom];
    const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    const gardens = [garden1, garden2, garden3];
    const garden = gardens[Math.floor(Math.random() * gardens.length)];

    const quantity = Math.floor(Math.random() * 20) + 1;
    const priceAtSale = vegetable.price * (0.9 + Math.random() * 0.2); // Giá dao động ±10%
    const total = quantity * priceAtSale;

    salesData.push({
      vegetableId: vegetable.id,
      gardenId: garden.id,
      quantity,
      priceAtSale: parseFloat(priceAtSale.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      time: saleDate,
    });
  }

  await prisma.sale.createMany({ data: salesData });
  console.log(`✅ Đã tạo ${salesData.length} sales\n`);

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

  console.log('✨ Seed dữ liệu hoàn tất!\n');
  console.log('📝 Thông tin đăng nhập:');
  console.log('   Admin:');
  console.log('     Email: admin@example.com');
  console.log('     Password: password123');
  console.log('   User 1:');
  console.log('     Email: user1@example.com');
  console.log('     Password: password123');
  console.log('   User 2:');
  console.log('     Email: user2@example.com');
  console.log('     Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

