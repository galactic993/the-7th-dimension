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
    
    console.log(`📥 取得済み: ${allUsers.length}ユーザー`);
  }

  return allUsers;
}

async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 削除失敗 (${userId}): ${response.status} ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`❌ 削除エラー (${userId}):`, error);
    return false;
  }
}

async function deleteAllUsers() {
  try {
    console.log('🔍 全ユーザーを取得中...');
    const users = await getAllUsers();
    
    console.log(`\n📊 削除対象: ${users.length}ユーザー`);
    
    if (users.length === 0) {
      console.log('✅ 削除するユーザーがありません');
      return;
    }

    // 確認プロンプト
    console.log('\n⚠️  警告: 全てのユーザーを削除します');
    console.log('📋 最初の5ユーザー:');
    users.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email_addresses[0]?.email_address || 'No email'} - ${user.first_name} ${user.last_name}`);
    });
    
    if (users.length > 5) {
      console.log(`   ... 他${users.length - 5}ユーザー`);
    }
    
    console.log('\n🚀 削除を開始します...');

    let successCount = 0;
    let failCount = 0;

    // バッチで削除（レート制限対策）
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const deletePromises = batch.map(async (user) => {
        const success = await deleteUser(user.id);
        if (success) {
          successCount++;
          console.log(`✅ 削除成功: ${user.email_addresses[0]?.email_address || user.id}`);
        } else {
          failCount++;
        }
        return success;
      });

      await Promise.all(deletePromises);
      
      // レート制限対策で待機
      if (i + batchSize < users.length) {
        console.log(`⏳ 待機中... (${successCount + failCount}/${users.length})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n📊 削除完了:`);
    console.log(`   ✅ 成功: ${successCount}ユーザー`);
    console.log(`   ❌ 失敗: ${failCount}ユーザー`);
    console.log(`   📋 合計: ${users.length}ユーザー`);

  } catch (error) {
    console.log('❌ エラーが発生しました:', error);
  }
}

deleteAllUsers();