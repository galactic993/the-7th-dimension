import { parse } from 'csv-parse';
import fs from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

// TypeScript types
interface UserRecord {
  "メールアドレス": string;
  "名前(姓)": string;
  "名前(名)": string;
  "入金": string;
}

interface CreateUserData {
  email_address: string[];
  password: string;
  first_name: string;
  last_name: string;
  public_metadata: {
    importedAt: string;
    batchId: string;
    paymentStatus: string;
    sourceFile: string;
  };
}

interface ImportResult {
  success: boolean;
  user?: any;
  error?: any;
  email?: string;
  file?: string;
}

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
        // メールアドレス重複エラーは警告として扱う
        if (response.status === 422 && errorText.includes('form_identifier_exists')) {
          throw new Error('EMAIL_EXISTS');
        }
        throw new Error(`Clerk API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response.json();
    }
  }
};

async function importUsersFromCSV(filePath: string, fileName: string): Promise<ImportResult[]> {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Remove BOM if present
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1);
  }
  
  return new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, async (err, records: UserRecord[]) => {
      if (err) {
        reject(err);
        return;
      }
      
      // 入金済みのユーザーのみフィルタリング
      const paidRecords = records.filter(record => record["入金"] === "入金済");
      
      console.log(`\n📁 ${fileName}:`);
      console.log(`📊 全レコード数: ${records.length}`);
      console.log(`💰 入金済み: ${paidRecords.length}`);
      console.log(`❌ 未入金: ${records.length - paidRecords.length}`);
      console.log(`🎯 インポート対象: ${paidRecords.length}ユーザー`);
      
      if (paidRecords.length === 0) {
        console.log('⚠️  入金済みユーザーがいません');
        resolve([]);
        return;
      }
      
      const results: ImportResult[] = [];
      
      // バッチ処理でレート制限を考慮
      const batchSize = 5; // レート制限を考慮して少なめに
      for (let i = 0; i < paidRecords.length; i += batchSize) {
        const batch = paidRecords.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (record: UserRecord): Promise<ImportResult> => {
          try {
            const user = await clerkClient.users.createUser({
              email_address: [record["メールアドレス"]],
              password: 'the7thdimension0721',
              first_name: record["名前(名)"],
              last_name: record["名前(姓)"],
              public_metadata: {
                importedAt: new Date().toISOString(),
                batchId: `import-${Date.now()}`,
                paymentStatus: record["入金"],
                sourceFile: fileName
              }
            });
            
            return { success: true, user, file: fileName };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage === 'EMAIL_EXISTS') {
              return { success: false, error: 'メールアドレス重複', email: record["メールアドレス"], file: fileName };
            }
            return { success: false, error: errorMessage, email: record["メールアドレス"], file: fileName };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // 進捗表示
        const processed = Math.min(i + batchSize, paidRecords.length);
        console.log(`  📥 進捗: ${processed}/${paidRecords.length} (${Math.round(processed/paidRecords.length*100)}%)`);
        
        // レート制限対策として待機
        if (i + batchSize < paidRecords.length) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      
      resolve(results);
    });
  });
}

async function importAllFiles() {
  const files = [
    { path: './csv/customers1.csv', name: 'customers1.csv' },
    { path: './csv/customers2.csv', name: 'customers2.csv' },
    { path: './csv/customers3.csv', name: 'customers3.csv' }
  ];
  
  console.log('🚀 全CSVファイルのインポートを開始します...');
  console.log('📋 対象ファイル: customers1.csv, customers2.csv, customers3.csv');
  console.log('💡 入金済みユーザーのみインポートします\n');
  
  let totalResults: ImportResult[] = [];
  
  for (const file of files) {
    try {
      console.log(`\n📂 ${file.name} を処理中...`);
      const fileResults = await importUsersFromCSV(file.path, file.name);
      totalResults.push(...fileResults);
      
      const successCount = fileResults.filter(r => r.success).length;
      const duplicateCount = fileResults.filter(r => !r.success && r.error === 'メールアドレス重複').length;
      const errorCount = fileResults.filter(r => !r.success && r.error !== 'メールアドレス重複').length;
      
      console.log(`  ✅ 成功: ${successCount}`);
      console.log(`  ⚠️  重複: ${duplicateCount}`);
      console.log(`  ❌ エラー: ${errorCount}`);
      
    } catch (error) {
      console.log(`❌ ${file.name} でエラーが発生:`, error);
    }
    
    // ファイル間で少し待機
    if (file !== files[files.length - 1]) {
      console.log('⏳ 次のファイルまで待機...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // 最終結果
  console.log('\n📊 全体の結果:');
  const totalSuccess = totalResults.filter(r => r.success).length;
  const totalDuplicate = totalResults.filter(r => !r.success && r.error === 'メールアドレス重複').length;
  const totalError = totalResults.filter(r => !r.success && r.error !== 'メールアドレス重複').length;
  
  console.log(`✅ 成功: ${totalSuccess}ユーザー`);
  console.log(`⚠️  重複: ${totalDuplicate}ユーザー`);
  console.log(`❌ エラー: ${totalError}ユーザー`);
  console.log(`📋 合計処理: ${totalResults.length}ユーザー`);
  
  console.log('\n🎉 全ファイルのインポートが完了しました！');
}

importAllFiles();