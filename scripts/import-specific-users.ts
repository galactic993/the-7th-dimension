import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// TypeScript types
interface CreateUserData {
  email_address: string[];
  password: string;
  first_name: string;
  last_name: string;
  public_metadata: {
    importedAt: string;
    batchId: string;
    paymentStatus: string;
    participationType: string;
  };
}

interface ImportResult {
  success: boolean;
  user?: any;
  error?: any;
  email?: string;
  name?: string;
}

// 2名の特定ユーザー情報
const specificUsers = [
  {
    email: "gime.kampo@gmail.com",
    firstName: "典子",
    lastName: "桐川",
    participationType: "オンライン参加"
  },
  {
    email: "pika1009per@gmail.com",
    firstName: "志織",
    lastName: "山崎",
    participationType: "オンライン参加"
  }
];

// Clerk Backend API Client
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY environment variable is required');
}

const clerkClient = {
  users: {
    createUser: async (userData: CreateUserData) => {
      const response = await fetch('https://api.clerk.com/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Clerk API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response.json();
    }
  }
};

async function importSpecificUsers(): Promise<ImportResult[]> {
  console.log(`🎯 特定の2名のユーザーをClerkに作成します\n`);
  
  const results: ImportResult[] = [];
  
  for (const userData of specificUsers) {
    try {
      console.log(`⏳ 作成中: ${userData.lastName} ${userData.firstName} (${userData.email})`);
      
      const user = await clerkClient.users.createUser({
        email_address: [userData.email],
        password: 'the7thdimension0721',
        first_name: userData.firstName,
        last_name: userData.lastName,
        public_metadata: {
          importedAt: new Date().toISOString(),
          batchId: `specific-import-${Date.now()}`,
          paymentStatus: "入金済",
          participationType: userData.participationType
        }
      });
      
      console.log(`✅ 成功: ${userData.lastName} ${userData.firstName}`);
      results.push({ 
        success: true, 
        user, 
        email: userData.email,
        name: `${userData.lastName} ${userData.firstName}`
      });
    } catch (error) {
      console.log(`❌ 失敗: ${userData.lastName} ${userData.firstName} - ${error}`);
      results.push({ 
        success: false, 
        error, 
        email: userData.email,
        name: `${userData.lastName} ${userData.firstName}`
      });
    }
    
    // レート制限対策として待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// スクリプト実行
async function main() {
  try {
    const results = await importSpecificUsers();
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n📊 結果サマリー:`);
    console.log(`✅ 成功: ${successful.length}ユーザー`);
    console.log(`❌ 失敗: ${failed.length}ユーザー`);
    
    if (failed.length > 0) {
      console.log(`\n❌ 失敗したユーザー:`);
      failed.forEach(result => {
        console.log(`- ${result.name} (${result.email}): ${result.error}`);
      });
    }
    
    if (successful.length > 0) {
      console.log(`\n✅ 成功したユーザー:`);
      successful.forEach(result => {
        console.log(`- ${result.name} (${result.email})`);
      });
    }
    
  } catch (error) {
    console.error('スクリプト実行エラー:', error);
  }
}

main();