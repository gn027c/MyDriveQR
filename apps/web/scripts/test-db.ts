/**
 * Script test kết nối Database
 * Chạy: npx tsx scripts/test-db.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load .env from current directory (apps/web)
dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDatabase() {
  console.log('🔍 Đang kiểm tra kết nối database...\n');

  try {
    // Test 1: Kết nối cơ bản
    console.log('1️⃣ Test kết nối...');
    await prisma.$connect();
    console.log('   ✅ Kết nối thành công!\n');

    // Test 2: Query database version
    console.log('2️⃣ Kiểm tra database info...');
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    console.log('   📊 PostgreSQL Version:', result[0]?.version?.split(' ')[1] || 'Unknown');
    console.log('   ✅ Database đang hoạt động!\n');

    // Test 3: Đếm số lượng Users
    console.log('3️⃣ Kiểm tra tables...');
    const userCount = await prisma.user.count();
    console.log('   👥 Số lượng Users:', userCount);

    const qrCodeCount = await prisma.qRCode.count();
    console.log('   📱 Số lượng QR Codes:', qrCodeCount);
    console.log('   ✅ Tables đã sẵn sàng!\n');

    // Test 4: Lấy danh sách Users
    if (userCount > 0) {
      console.log('4️⃣ Danh sách Users:');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      users.forEach((user: { email: string; name: string | null; role: string; createdAt: Date }, index: number) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role})`);
        console.log(`      Tên: ${user.name || 'N/A'}`);
        console.log(`      Tạo lúc: ${user.createdAt.toLocaleString('vi-VN')}`);
        console.log('');
      });
    } else {
      console.log('4️⃣ Chưa có user nào trong database\n');
    }

    // Test 5: Hiển thị thông tin DATABASE_URL
    console.log('5️⃣ Thông tin kết nối:');
    const dbUrl = process.env.DATABASE_URL || '';
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
    
    if (urlParts) {
      const [, user, , host, database] = urlParts;
      console.log(`   🔗 Host: ${host}`);
      console.log(`   👤 User: ${user}`);
      console.log(`   🗄️  Database: ${database.split('?')[0]}`);
    } else {
      console.log('   ⚠️  Không parse được DATABASE_URL');
    }

    console.log('\n✅ TẤT CẢ TESTS ĐỀU PASS!');
    console.log('💡 Database đã sẵn sàng cho ứng dụng.\n');

  } catch (error) {
    console.error('\n❌ LỖI KẾT NỐI DATABASE!\n');
    
    if (error instanceof Error) {
      console.error('Chi tiết lỗi:', error.message);
      
      // Hướng dẫn sửa lỗi phổ biến
      if (error.message.includes('Environment variable not found: DATABASE_URL')) {
        console.error('\n📝 CÁCH SỬA:');
        console.error('1. Mở file apps/web/.env');
        console.error('2. Thêm dòng: DATABASE_URL="your-connection-string"');
        console.error('3. Chạy lại script này\n');
      } else if (error.message.includes("Can't reach database server")) {
        console.error('\n📝 CÁCH SỬA:');
        console.error('1. Kiểm tra DATABASE_URL có đúng không');
        console.error('2. Kiểm tra database server đang chạy');
        console.error('3. Kiểm tra firewall/network settings\n');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('\n📝 CÁCH SỬA:');
        console.error('Chạy lệnh để tạo tables:');
        console.error('  pnpm run db:push\n');
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy test
testDatabase();
