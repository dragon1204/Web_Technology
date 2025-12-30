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
    await prisma.vegetable_garden.deleteMany().catch(() => {});
    await prisma.sensor.deleteMany().catch(() => {});
    await prisma.garden.deleteMany().catch(() => {});
    await prisma.vegetable.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
    await prisma.sensorType.deleteMany().catch(() => {});
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

  // 2. Tạo Sensor Types (xóa và tạo lại để đảm bảo ID nhất quán)
  console.log('📡 Tạo sensor types...');
  await prisma.sensorType.deleteMany({});
  
  const tempSensorType = await prisma.sensorType.create({
    data: {
      name: 'Temperature',
      unit: '°C',
    },
  });

  const humiditySensorType = await prisma.sensorType.create({
    data: {
      name: 'Humidity',
      unit: '%',
    },
  });

  const soilMoistureSensorType = await prisma.sensorType.create({
    data: {
      name: 'Soil Moisture',
      unit: '%',
    },
  });
  console.log(`✅ Đã tạo ${3} sensor types\n`);

  // 3. Tạo Gardens (xóa và tạo lại)
  console.log('🏡 Tạo gardens...');
  await prisma.garden.deleteMany({});
  
  const garden1 = await prisma.garden.create({
    data: {
      name: 'Vườn Rau Cải Xanh',
      ownerId: user1.id,
      area: 100.5,
      location: 'Hà Nội',
      description: 'Vườn trồng rau cải xanh, cà rốt',
    },
  });

  const garden2 = await prisma.garden.create({
    data: {
      name: 'Vườn Rau Sạch',
      ownerId: user1.id,
      area: 150.0,
      location: 'Hồ Chí Minh',
      description: 'Vườn trồng nhiều loại rau',
    },
  });

  const garden3 = await prisma.garden.create({
    data: {
      name: 'Vườn Rau Hữu Cơ',
      ownerId: user2.id,
      area: 80.0,
      location: 'Đà Nẵng',
      description: 'Vườn rau hữu cơ chất lượng cao',
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
  await prisma.vegetable_garden.createMany({
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

  // 6. Tạo Sensors
  console.log('📊 Tạo sensors...');
  const sensor1 = await prisma.sensor.create({
    data: {
      model: 'DHT22',
      name: 'Nhiệt độ vườn 1',
      typeId: tempSensorType.id,
      gardenId: garden1.id,
    },
  });

  const sensor2 = await prisma.sensor.create({
    data: {
      model: 'DHT22',
      name: 'Độ ẩm vườn 1',
      typeId: humiditySensorType.id,
      gardenId: garden1.id,
    },
  });

  const sensor3 = await prisma.sensor.create({
    data: {
      model: 'DHT22',
      name: 'Nhiệt độ vườn 2',
      typeId: tempSensorType.id,
      gardenId: garden2.id,
    },
  });

  const sensor4 = await prisma.sensor.create({
    data: {
      model: 'Soil Moisture Sensor',
      name: 'Độ ẩm đất vườn 3',
      typeId: soilMoistureSensorType.id,
      gardenId: garden3.id,
    },
  });
  console.log(`✅ Đã tạo ${4} sensors\n`);

  // 7. Tạo Sensor Data (dữ liệu mẫu cho 30 ngày qua)
  console.log('📈 Tạo sensor data...');
  const sensorDataPromises: Promise<any>[] = [];
  const now = new Date();

  // Tạo dữ liệu cho sensor1 (nhiệt độ) - 30 ngày, mỗi giờ 1 record
  for (let day = 0; day < 30; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);

      // Nhiệt độ dao động từ 20-35 độ
      const temperature = 20 + Math.random() * 15 + Math.sin(hour / 24 * Math.PI * 2) * 5;
      sensorDataPromises.push(
        prisma.sensorData.create({
          data: {
            sensorId: sensor1.id,
            value: parseFloat(temperature.toFixed(2)),
            time: timestamp,
          },
        }),
      );
    }
  }

  // Tạo dữ liệu cho sensor2 (độ ẩm) - 30 ngày, mỗi 2 giờ 1 record
  for (let day = 0; day < 30; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);

      // Độ ẩm dao động từ 40-80%
      const humidity = 40 + Math.random() * 40 + Math.sin(hour / 24 * Math.PI * 2) * 10;
      sensorDataPromises.push(
        prisma.sensorData.create({
          data: {
            sensorId: sensor2.id,
            value: parseFloat(humidity.toFixed(2)),
            time: timestamp,
          },
        }),
      );
    }
  }

  await Promise.all(sensorDataPromises);
  console.log(`✅ Đã tạo sensor data (${sensorDataPromises.length} records)\n`);

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
      sensorId: sensor1.id,
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
      sensorId: sensor2.id,
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
        sensorId: sensor1.id,
        value: 36.5,
        message: 'Nhiệt độ vượt ngưỡng tối đa: 36.5°C',
        severity: 'warning',
        isResolved: false,
      },
      {
        ruleId: alertRule2.id,
        sensorId: sensor2.id,
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

