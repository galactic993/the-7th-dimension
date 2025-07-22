import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY environment variable is required');
}

// 削除対象ユーザーのID（最新の2名）
const usersToDelete = [
  'user_304TYV49ju2HzgXVnb5FXxNs2am', // 西藤 孝則
  'user_304TYRVKUIxTvaazhgxqqjfgIsX'  // 片野 真
];

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

async function deleteSpecificUsers() {
  try {
    console.log('🎯 指定された2名のユーザーを削除します');
    console.log(`📋 削除対象: ${usersToDelete.length}ユーザー`);
    
    let successCount = 0;
    let failCount = 0;

    for (const userId of usersToDelete) {
      console.log(`⏳ 削除中: ${userId}`);
      
      const success = await deleteUser(userId);
      if (success) {
        successCount++;
        console.log(`✅ 削除成功: ${userId}`);
      } else {
        failCount++;
      }
      
      // レート制限対策として待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n📊 削除完了:`);
    console.log(`   ✅ 成功: ${successCount}ユーザー`);
    console.log(`   ❌ 失敗: ${failCount}ユーザー`);

  } catch (error) {
    console.log('❌ エラーが発生しました:', error);
  }
}

deleteSpecificUsers();