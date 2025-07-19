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
  };
}

interface ImportResult {
  success: boolean;
  user?: any;
  error?: any;
  email?: string;
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
        throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    }
  }
};

async function importUsersFromCSV(filePath: string): Promise<ImportResult[]> {
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
      
      console.log(`📊 CSVの全レコード数: ${records.length}`);
      console.log(`💰 入金済みユーザー数: ${paidRecords.length}`);
      console.log(`❌ 未入金ユーザー数: ${records.length - paidRecords.length}`);
      console.log(`🎯 インポート対象: ${paidRecords.length}ユーザー\n`);
      
      const results: ImportResult[] = [];
      
      // バッチ処理でレート制限を考慮
      const batchSize = 10;
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
                paymentStatus: record["入金"]
              }
            });
            
            return { success: true, user };
          } catch (error) {
            return { success: false, error, email: record["メールアドレス"] };
          }
        });
        // NOTE: This limits batch to only 1 user for testing
        batchPromises.length = 1;
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // レート制限対策として待機
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      resolve(results);
    });
  });
}

importUsersFromCSV('./csv/customers1.csv').then((results) => {
  console.log(results);
  console.log('done');
});