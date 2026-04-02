// Script de prueba para verificar inserción en transacciones_epayco_logs
import { clienteSupabase } from '../configuracion/supabase.js';

async function probarInsercionTransacciones() {
  try {
    // Datos de prueba
    const datosTransaccionPrueba = {
      pedido_id: '12345678-1234-1234-1234-123456789012', // UUID de prueba
      epayco_ref_payco: 'TEST_REF_' + Date.now(),
      epayco_transaction_id: 'TEST_TRANS_' + Date.now(),
      tipo_evento: 'test',
      estado_nuevo: 'test',
      cod_response: '1',
      mensaje_response: 'Prueba de inserción',
      datos_completos: {
        test: true,
        timestamp: new Date().toISOString(),
        ref_payco: 'TEST_REF_' + Date.now()
      },
      creado_el: new Date().toISOString()
    };

    // Intentar insertar
    const { data, error } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .insert([datosTransaccionPrueba])
      .select();

    if (error) {
      console.error('❌ Error al insertar datos de prueba:', error);
      
      // Verificar si es un problema de RLS
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        console.error('🔒 PROBLEMA DETECTADO: Las políticas RLS están bloqueando la inserción');
      }
      
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error('❌ Error inesperado en la prueba:', error);
    console.error('📋 Stack trace:', error.stack);
    return false;
  }
}

// Función para verificar la estructura de la tabla
async function verificarEstructuraTabla() {
  try {
    // Intentar hacer un SELECT simple para verificar que la tabla existe
    const { data, error } = await clienteSupabase
      .from('transacciones_epayco_logs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error al acceder a la tabla:', error);
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.error('❌ Error inesperado al verificar estructura:', error);
    return false;
  }
}

// Función principal de prueba
async function ejecutarPruebas() {
  // Verificar estructura
  const estructuraOK = await verificarEstructuraTabla();
  if (!estructuraOK) {
    console.error('❌ No se puede acceder a la tabla. Verifica que existe y tiene las políticas RLS correctas.');
    return;
  }
  
  // Probar inserción
  const insercionOK = await probarInsercionTransacciones();
  if (insercionOK) {
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
  } else {
    console.error('❌ Las pruebas fallaron. Revisa los errores anteriores.');
  }
}

// Exportar funciones para uso en consola
window.probarTransaccionesEpayco = {
  ejecutarPruebas,
  probarInsercionTransacciones,
  verificarEstructuraTabla
};

export { ejecutarPruebas, probarInsercionTransacciones, verificarEstructuraTabla };