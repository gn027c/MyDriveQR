import 'dotenv/config';

/**
 * Kiểm tra nhanh các biến môi trường quan trọng.
 * Chạy:
 *   pnpm tsx scripts/check-env.ts
 */

const REQUIRED_VARS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'ADMIN_EMAIL',
] as const;

const OPTIONAL_VARS = {
  GOOGLE_DRIVE_FOLDER_ID: '(optional)',
};

function mask(value: string | undefined): string {
  if (!value) return 'N/A';
  return value.length <= 10 ? value : `${value.substring(0, 10)}…`;
}

function checkEnv() {
  console.log('🔍 Kiểm tra biến môi trường\n');

  const results: Record<string, string> = {};
  let allSet = true;

  for (const name of REQUIRED_VARS) {
    const isSet = Boolean(process.env[name]);
    results[name] = isSet ? '✓ Set' : '✗ Missing';
    if (!isSet) {
      allSet = false;
    }
  }

  for (const [name, label] of Object.entries(OPTIONAL_VARS)) {
    const isSet = Boolean(process.env[name]);
    results[name] = isSet ? '✓ Set' : label;
  }

  console.table(
    Object.entries(results).map(([name, status]) => ({
      Variable: name,
      Status: status,
      Preview: mask(process.env[name]),
    })),
  );

  if (allSet) {
    console.log('\n✅ Tất cả biến môi trường bắt buộc đã được thiết lập!');
    process.exit(0);
  } else {
    console.log('\n❌ Thiếu một số biến môi trường bắt buộc. Vui lòng cập nhật file .env.');
    process.exit(1);
  }
}

checkEnv();
