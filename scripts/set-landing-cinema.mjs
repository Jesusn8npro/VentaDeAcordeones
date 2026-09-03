import { createClient } from '@supabase/supabase-js'
import { leerEnv } from './lib/recortar.mjs'

// Claves desde .env (nunca hardcodeadas en el repo)
const env = leerEnv()

const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await client
  .from('productos')
  .update({ landing_tipo: 'cinema' })
  .neq('landing_tipo', 'cinema')
  .select('id, nombre, landing_tipo')

if (error) {
  console.error('Error:', error.message)
  process.exit(1)
}

console.log(`\n✅ Actualizados ${data?.length || 0} productos a landing_tipo = 'cinema'\n`)
data?.forEach(p => console.log(`  • ${p.nombre}`))
