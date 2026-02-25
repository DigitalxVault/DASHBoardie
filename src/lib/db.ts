import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Initialize the activity_logs table
export async function initActivityLogsTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        user_name VARCHAR(255),
        action VARCHAR(50) NOT NULL,
        timestamp BIGINT NOT NULL,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    // Create index on timestamp for faster date range queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp
      ON activity_logs(timestamp DESC)
    `
    // Create index on user_id for user-specific queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id
      ON activity_logs(user_id)
    `
    console.log('Activity logs table initialized')
  } catch (error) {
    console.error('Error initializing activity logs table:', error)
  }
}

// Auto-initialize on import
initActivityLogsTable().catch(console.error)
