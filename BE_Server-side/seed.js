// Wrapper script để chạy seed trong Node.js
const { execSync } = require('child_process');

console.log('🔄 Đang kiểm tra và generate Prisma Client...');
try {
  // Kiểm tra xem có cần migrate không
  console.log('📋 Kiểm tra migration status...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migration đã được áp dụng\n');
} catch (error) {
  console.log('⚠️  Migration có thể đã được áp dụng hoặc cần chạy migrate dev\n');
}

try {
  console.log('🔧 Đang generate Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client đã được generate\n');
} catch (error) {
  console.log('❌ Lỗi khi generate Prisma Client!');
  console.log('💡 Hãy chạy thủ công: npx prisma generate\n');
  process.exit(1);
}

require('ts-node').register({
  project: './tsconfig.seed.json',
  transpileOnly: true,
});

require('./prisma/seed.ts');

