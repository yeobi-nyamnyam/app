import path from 'node:path'

import dotenv from 'dotenv'
import type { CodegenConfig } from '@graphql-codegen/cli'

// apps/mobile/.env를 단일 소스로 사용 (apps/server/.env와 중복 관리하지 않기 위함)
dotenv.config({ path: path.resolve(__dirname, 'apps/mobile/.env') })

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
      // Apollo Client 4는 훅(useQuery/useMutation)을 `@apollo/client/react`의
      // 네임스페이스 타입(예: useMutation.Options)으로 재구성해서, 구버전 API를
      // 가정하는 typescript-react-apollo 플러그인과 호환되지 않는다. 대신
      // typed-document-node로 TypedDocumentNode를 생성해 컴포넌트에서
      // `useQuery(XxxDocument, ...)` / `useMutation(XxxDocument, ...)`로 직접 호출한다.
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        scalars: {
          UUID: 'string',
          Date: 'string',
          Datetime: 'string',
          Time: 'string',
          BigFloat: 'number',
          BigInt: 'string',
          Cursor: 'string',
          Opaque: 'unknown',
        },
      },
    },
  },
}

export default config
