// Script de prueba para verificar la inserción en Supabase
// Ejecutar desde la consola del navegador para diagnosticar problemas

import { clienteSupabase } from '../configuracion/supabase.js';

/**
 * Función para probar la inserción en la tabla transacciones_epayco_logs
 */
export async function probarInsercionSupabase() {
  try {
    // Verificar configuración del cliente
    if (!clienteSupabase) {
      console.error('❌ Cliente Supabase no está configurado');
      return;
    }

    // Probar conexión básica
    const { data: testConnection, error: connectionError } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return;
    }

    // Probar inserción de datos de prueba
    const datosTest = {
      pedido_id: 'TEST_' + Date.now(),
      epayco_ref_payco: 'REF_TEST_' + Date.now(),
      epayco_transaction_id: 'TXN_TEST_' + Date.now(),
      tipo_evento: 'test',
      estado_nuevo: 'test',
      cod_response: '999',
      mensaje_response: 'Prueba de inserción',
      datos_completos: { test: true, timestamp: new Date().toISOString() },
      creado_el: new Date().toISOString()
    };

    const { data, error } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .insert([datosTest])
      .select();

    if (error) {
      console.error('❌ Error en la inserción:', error);
      
      // Diagnóstico específico
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        console.error('🔒 PROBLEMA: Las políticas RLS están bloqueando la inserción');
      } else if (error.message?.includes('permission denied')) {
        console.error('🔒 PROBLEMA: Permisos insuficientes');
      } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.error('🗃️ PROBLEMA: La tabla no existe');
      }
      
      return false;
    }

    // Verificar que se puede leer el registro insertado
    const { data: readData, error: readError } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .select('*')
      .eq('pedido_id', datosTest.pedido_id);

    if (readError) {
      console.error('❌ Error al leer el registro:', readError);
      return false;
    }

    // Limpiar datos de prueba
    const { error: deleteError } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .delete()
      .eq('pedido_id', datosTest.pedido_id);

    if (deleteError) {
      console.warn('⚠️ No se pudo eliminar el registro de prueba:', deleteError);
    }

    return true;

  } catch (error) {
    console.error('❌ Error inesperado en la prueba:', error);
    console.error('📋 Stack trace:', error.stack);
    return false;
  }
}

// Función para ejecutar desde la consola del navegador
window.probarSupabase = probarInsercionSupabase;