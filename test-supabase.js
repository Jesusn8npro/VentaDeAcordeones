/**
 * Script de prueba para diagnosticar problemas con Supabase
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
dotenv.config();

// Crear cliente de Supabase directamente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const clienteSupabase = createClient(supabaseUrl, supabaseAnonKey);

async function probarConexionSupabase() {
  console.log('🔍 Iniciando diagnóstico de Supabase...');
  
  try {
    // 1. Verificar configuración del cliente
    console.log('📋 Configuración del cliente:');
    console.log('- URL:', clienteSupabase.supabaseUrl);
    console.log('- Key:', clienteSupabase.supabaseKey ? 'Configurada ✅' : 'No configurada ❌');
    
    // 2. Probar conexión básica
    console.log('\n🔗 Probando conexión básica...');
    const { data: testData, error: testError } = await clienteSupabase
      .from('pedidos')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error en conexión básica:', testError);
    } else {
      console.log('✅ Conexión básica exitosa');
    }
    
    // 3. Verificar si existe la tabla transacciones_epayco_logs
    console.log('\n📊 Verificando tabla transacciones_epayco_logs...');
    const { data: tablaData, error: tablaError } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .select('*')
      .limit(1);
    
    if (tablaError) {
      console.error('❌ Error al acceder a tabla transacciones_epayco_logs:', tablaError);
      console.log('💡 Posibles causas:');
      console.log('   - La tabla no existe');
      console.log('   - No tienes permisos RLS');
      console.log('   - Error en la configuración');
    } else {
      console.log('✅ Tabla transacciones_epayco_logs accesible');
    }
    
    // 4. Probar inserción de prueba
    console.log('\n💾 Probando inserción de prueba...');
    const datosTest = {
      pedido_id: 'TEST-' + Date.now(),
      epayco_ref_payco: 'TEST-REF-' + Date.now(),
      tipo_evento: 'test',
      estado_nuevo: 'test',
      datos_completos: { test: true },
      creado_el: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .insert([datosTest]);
    
    if (insertError) {
      console.error('❌ Error al insertar datos de prueba:', insertError);
      console.log('📋 Detalles del error:', insertError);
    } else {
      console.log('✅ Inserción de prueba exitosa:', insertData);
    }
    
    // 5. Verificar autenticación
    console.log('\n👤 Verificando autenticación...');
    const { data: { user }, error: authError } = await clienteSupabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError);
    } else if (user) {
      console.log('✅ Usuario autenticado:', user.email);
    } else {
      console.log('⚠️ No hay usuario autenticado (modo anónimo)');
    }
    
  } catch (error) {
    console.error('💥 Error general en el diagnóstico:', error);
  }
}

// Ejecutar el diagnóstico
probarConexionSupabase();