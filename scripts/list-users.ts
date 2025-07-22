import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY environment variable is required');
}

interface User {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string;
  last_name: string;
  public_metadata: any;
  created_at: number;
}

async function getAllUsers(): Promise<User[]> {
  const allUsers: User[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Clerk API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const users = await response.json();
    allUsers.push(...users);
    
    hasMore = users.length === limit;
    offset += limit;
  }

  return allUsers;
}

async function listUsers() {
  try {
    console.log('🔍 ユーザー一覧を取得中...');
    const users = await getAllUsers();
    
    console.log(`\n📊 総ユーザー数: ${users.length}/100`);
    
    if (users.length === 0) {
      console.log('👥 登録ユーザーがありません');
      return;
    }

    // 最新10ユーザーを表示
    console.log('\n📋 最新10ユーザー:');
    users
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 10)
      .forEach((user, index) => {
        const email = user.email_addresses[0]?.email_address || 'No email';
        const name = `${user.last_name || ''} ${user.first_name || ''}`.trim() || 'No name';
        const metadata = user.public_metadata;
        console.log(`   ${index + 1}. ${email} - ${name} (ID: ${user.id})`);
        if (metadata?.participationType) {
          console.log(`      参加タイプ: ${metadata.participationType}`);
        }
      });

  } catch (error) {
    console.log('❌ エラーが発生しました:', error);
  }
}

listUsers();