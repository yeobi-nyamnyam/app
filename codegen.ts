import 'dotenv/config'

import type { CodegenConfig } from '@graphql-codegen/cli'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY env vars (see .env.example)')
}

const config: CodegenConfig = {
  schema: [
    {
      [`${supabaseUrl}/graphql/v1`]: {
        headers: {
          apikey: supabaseAnonKey,
        },
      },
    },
  ],
  documents: 'apps/mobile/src/graphql/**/*.graphql',
  generates: {
    'packages/types/src/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
    },
  },
}

export default config
