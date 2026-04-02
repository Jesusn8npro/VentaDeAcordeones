<!-- =====================================================
💬 ACADEMIA VALLENATA ONLINE - DASHBOARD LEADS CHAT
===================================================== -->
<script>
	import { onMount } from 'svelte';
	import { leadsService } from '$lib/services/leadsService';
	import { chatService } from '$lib/services/chatService';
	import { supabase } from '$lib/supabase/clienteSupabase';

	// Estado del dashboard
	let leads = [];
	let estadisticas = {};
	let cargando = true;
	let filtroTipo = 'todos';
	let filtroConvertido = 'todos';
	let busqueda = '';
	let leadSeleccionado = null;
	let mostrarModal = false;
	let mostrarConversaciones = false;
	let conversacionesActuales = [];

	// Paginación
	let paginaActual = 1;
	let leadsPerPage = 10;
	
	// Filtros reactivos
	$: leadsFiltrados = filtrarLeads(leads, filtroTipo, filtroConvertido, busqueda);
	$: leadsEnPagina = paginarLeads(leadsFiltrados, paginaActual, leadsPerPage);
	$: totalPaginas = Math.ceil(leadsFiltrados.length / leadsPerPage);

	onMount(async () => {
		await cargarDatos();
	});

	async function cargarDatos() {
		cargando = true;
		try {
			// Obtener todos los leads
			leads = await leadsService.obtenerTodos();
			
			// Obtener estadísticas
			estadisticas = await leadsService.obtenerEstadisticas();
		} catch (error) {
			console.error('Error cargando datos:', error);
		}
		cargando = false;
	}

	function filtrarLeads(leads, tipo, convertido, busqueda) {
		return leads.filter(lead => {
			// Filtro por tipo
			if (tipo !== 'todos' && lead.tipo_consulta !== tipo) return false;
			
			// Filtro por conversión
			if (convertido === 'si' && !lead.convertido_a_usuario) return false;
			if (convertido === 'no' && lead.convertido_a_usuario) return false;
			
			// Filtro por búsqueda
			if (busqueda) {
				const texto = `${lead.nombre} ${lead.email} ${lead.whatsapp}`.toLowerCase();
				if (!texto.includes(busqueda.toLowerCase())) return false;
			}
			
			return true;
		});
	}

	function paginarLeads(leads, pagina, perPage) {
		const inicio = (pagina - 1) * perPage;
		return leads.slice(inicio, inicio + perPage);
	}

	function verDetalle(lead) {
		leadSeleccionado = lead;
		mostrarModal = true;
	}

	function formatearFecha(fecha) {
		return new Date(fecha).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getTipoColor(tipo) {
		const colores = {
			general: 'bg-blue-500',
			ventas: 'bg-green-500',
			soporte: 'bg-yellow-500',
			tecnico: 'bg-red-500',
			pagos: 'bg-purple-500',
			cursos: 'bg-indigo-500'
		};
		return colores[tipo] || 'bg-gray-500';
	}

	async function verificarConversiones() {
		try {
			const resultado = await fetch('/api/admin/verificar-conversiones', { method: 'POST' });
			const data = await resultado.json();
			
			if (data.success) {
				alert(`✅ ${data.conversiones} leads actualizados como convertidos`);
				await cargarDatos();
			}
		} catch (error) {
			console.error('Error verificando conversiones:', error);
		}
	}

	// 📖 Obtener conversaciones para un lead específico
	async function obtenerConversaciones(lead) {
		try {
			console.log('🔍 Buscando conversaciones para chatId:', lead.chat_id);
			
			const { data: conversaciones, error } = await supabase
				.from('chats_envivo_academia')
				.select('*')
				.or(`session_id.eq.${lead.chat_id},chat_id.eq.${lead.chat_id}`)
				.order('created_at', { ascending: true });

			if (error) {
				console.error('❌ Error obteniendo conversaciones:', error);
				return [];
			}

			console.log('📖 Conversaciones raw:', conversaciones);

			// 🔧 MAPEAR datos de diferentes estructuras
			const conversacionesMapeadas = conversaciones?.map((conv) => {
				let mensaje = '';
				let tipo = 'usuario';
				let timestamp = conv.created_at;

				// Verificar si message es objeto JSONB
				if (conv.message && typeof conv.message === 'object') {
					// Estructura de N8N (bot)
					if (conv.message.content) {
						mensaje = conv.message.content;
						tipo = conv.message.type === 'ai' ? 'bot' : 'usuario';
						
						// 🧹 LIMPIAR mensaje de usuario si viene con prefijo de N8N
						if (tipo === 'usuario' && mensaje.includes('El usuario') && mensaje.includes('ha enviado el siguiente mensaje')) {
							// Extraer solo el mensaje real después del prefijo
							const regex = /El usuario .+ ha enviado el siguiente mensaje\s*(.*)$/;
							const match = mensaje.match(regex);
							if (match && match[1]) {
								mensaje = match[1].trim();
							}
						}
					}
					// Estructura de nuestra app (usuario)
					else if (conv.message.texto) {
						mensaje = conv.message.texto;
						tipo = conv.message.tipo || 'usuario';
					}
					// Fallback para otros casos
					else {
						mensaje = JSON.stringify(conv.message);
						tipo = 'sistema';
					}
				} else {
					// Si message no es objeto, usarlo directamente
					mensaje = conv.message || 'Mensaje vacío';
				}

				return {
					id: conv.id,
					mensaje: mensaje,
					tipo_mensaje: tipo,
					timestamp: timestamp,
					created_at: timestamp,
					metadata: conv.message?.metadata || {}
				};
			}) || [];

			console.log('📋 Conversaciones mapeadas:', conversacionesMapeadas);
			return conversacionesMapeadas;

		} catch (error) {
			console.error('❌ Error en obtenerConversaciones:', error);
			return [];
		}
	}

	// 🔍 Ver conversaciones (función para el modal)
	async function verConversaciones(lead) {
		try {
			leadSeleccionado = lead;
			conversacionesActuales = await obtenerConversaciones(lead);
			mostrarConversaciones = true;
		} catch (error) {
			console.error('❌ Error en verConversaciones:', error);
			conversacionesActuales = [];
			mostrarConversaciones = true;
		}
	}
</script>

<svelte:head>
	<title>📊 Dashboard Leads Chat - Academia Vallenata</title>
</svelte:head>

<div class="dashboard-leads">
	<!-- 🎯 Header con estadísticas -->
	<div class="header-dashboard">
		<div class="titulo-seccion">
			<h1>💬 Dashboard Leads Chat</h1>
			<p>Gestión completa de contactos del chat en vivo</p>
		</div>
		
		<button on:click={verificarConversiones} class="btn-actualizar">
			🔄 Verificar Conversiones
		</button>
	</div>

	<!-- 📊 Tarjetas de estadísticas -->
	{#if !cargando && estadisticas}
		<div class="stats-grid">
			<div class="stat-card total">
				<div class="stat-icon">👥</div>
				<div class="stat-info">
					<h3>{estadisticas.total || 0}</h3>
					<p>Total Leads</p>
				</div>
			</div>
			
			<div class="stat-card convertidos">
				<div class="stat-icon">✅</div>
				<div class="stat-info">
					<h3>{estadisticas.convertidos || 0}</h3>
					<p>Convertidos</p>
				</div>
			</div>
			
			<div class="stat-card pendientes">
				<div class="stat-icon">⏳</div>
				<div class="stat-info">
					<h3>{(estadisticas.total || 0) - (estadisticas.convertidos || 0)}</h3>
					<p>Pendientes</p>
				</div>
			</div>
			
			<div class="stat-card conversion">
				<div class="stat-icon">📈</div>
				<div class="stat-info">
					<h3>{estadisticas.total > 0 ? Math.round((estadisticas.convertidos / estadisticas.total) * 100) : 0}%</h3>
					<p>Conversión</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- 🔍 Filtros y búsqueda -->
	<div class="filtros-panel">
		<div class="busqueda-container">
			<input 
				type="text" 
				placeholder="🔍 Buscar por nombre, email o WhatsApp..."
				bind:value={busqueda}
				class="campo-busqueda"
			>
		</div>
		
		<div class="filtros-container">
			<select bind:value={filtroTipo} class="filtro-select">
				<option value="todos">📋 Todos los tipos</option>
				<option value="general">💬 General</option>
				<option value="ventas">💰 Ventas</option>
				<option value="soporte">🛠️ Soporte</option>
				<option value="tecnico">⚙️ Técnico</option>
				<option value="pagos">💳 Pagos</option>
				<option value="cursos">🎓 Cursos</option>
			</select>
			
			<select bind:value={filtroConvertido} class="filtro-select">
				<option value="todos">🔄 Todos los estados</option>
				<option value="si">✅ Convertidos</option>
				<option value="no">⏳ Pendientes</option>
			</select>
		</div>
	</div>

	<!-- 📋 Tabla de leads -->
	{#if cargando}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p>Cargando leads...</p>
		</div>
	{:else if leadsEnPagina.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📭</div>
			<h3>No hay leads que mostrar</h3>
			<p>No se encontraron resultados con los filtros aplicados</p>
		</div>
	{:else}
		<div class="tabla-container">
			<table class="tabla-leads">
				<thead>
					<tr>
						<th>👤 Lead</th>
						<th>📧 Contacto</th>
						<th>💬 Consulta</th>
						<th>⏰ Fecha</th>
						<th>✅ Estado</th>
						<th>🔧 Acciones</th>
					</tr>
				</thead>
				<tbody>
					{#each leadsEnPagina as lead (lead.id)}
						<tr class="fila-lead">
							<td class="celda-lead">
								<div class="lead-info">
									<div class="lead-nombre">{lead.nombre}</div>
									<div class="lead-id">ID: {lead.chat_id}</div>
								</div>
							</td>
							
							<td class="celda-contacto">
								<div class="contacto-info">
									<div class="email">📧 {lead.email}</div>
									{#if lead.whatsapp}
										<div class="whatsapp">📱 {lead.whatsapp}</div>
									{/if}
								</div>
							</td>
							
							<td class="celda-tipo">
								<span class="tipo-badge {getTipoColor(lead.tipo_consulta)}">
									{lead.tipo_consulta}
								</span>
							</td>
							
							<td class="celda-fecha">
								{formatearFecha(lead.created_at)}
							</td>
							
							<td class="celda-estado">
								{#if lead.convertido_a_usuario}
									<span class="estado-badge convertido">✅ Convertido</span>
								{:else}
									<span class="estado-badge pendiente">⏳ Pendiente</span>
								{/if}
							</td>
							
							<td class="celda-acciones">
								<button 
									on:click={() => verDetalle(lead)}
									class="btn-accion ver"
									title="Ver detalle"
								>
									👁️
								</button>
								<button 
									on:click={() => verConversaciones(lead)}
									class="btn-accion chat"
									title="Ver conversaciones"
								>
									💬
								</button>
								{#if lead.whatsapp}
									<a 
										href="https://wa.me/{lead.whatsapp.replace(/\D/g, '')}"
										target="_blank"
										class="btn-accion whatsapp"
										title="Contactar por WhatsApp"
									>
										📱
									</a>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		
		<!-- 📄 Paginación -->
		{#if totalPaginas > 1}
			<div class="paginacion">
				<button 
					on:click={() => paginaActual = Math.max(1, paginaActual - 1)}
					disabled={paginaActual === 1}
					class="btn-pagina"
				>
					⬅️ Anterior
				</button>
				
				<span class="info-pagina">
					Página {paginaActual} de {totalPaginas}
				</span>
				
				<button 
					on:click={() => paginaActual = Math.min(totalPaginas, paginaActual + 1)}
					disabled={paginaActual === totalPaginas}
					class="btn-pagina"
				>
					Siguiente ➡️
				</button>
			</div>
		{/if}
	{/if}
</div>

<!-- 🔍 Modal de detalle -->
{#if mostrarModal && leadSeleccionado}
	<div class="modal-overlay" on:click={() => mostrarModal = false}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3>📊 Detalle del Lead</h3>
				<button on:click={() => mostrarModal = false} class="btn-cerrar">❌</button>
			</div>
			
			<div class="modal-body">
				<div class="detalle-grid">
					<div class="detalle-item">
						<strong>👤 Nombre:</strong>
						<span>{leadSeleccionado.nombre}</span>
					</div>
					
					<div class="detalle-item">
						<strong>📧 Email:</strong>
						<span>{leadSeleccionado.email}</span>
					</div>
					
					{#if leadSeleccionado.whatsapp}
						<div class="detalle-item">
							<strong>📱 WhatsApp:</strong>
							<span>{leadSeleccionado.whatsapp}</span>
						</div>
					{/if}
					
					<div class="detalle-item">
						<strong>💬 Tipo de consulta:</strong>
						<span class="tipo-badge {getTipoColor(leadSeleccionado.tipo_consulta)}">
							{leadSeleccionado.tipo_consulta}
						</span>
					</div>
					
					<div class="detalle-item">
						<strong>🆔 Chat ID:</strong>
						<span class="chat-id">{leadSeleccionado.chat_id}</span>
					</div>
					
					<div class="detalle-item">
						<strong>⏰ Fecha de registro:</strong>
						<span>{formatearFecha(leadSeleccionado.created_at)}</span>
					</div>
					
					<div class="detalle-item">
						<strong>✅ Estado:</strong>
						<span class="estado-badge {leadSeleccionado.convertido_a_usuario ? 'convertido' : 'pendiente'}">
							{leadSeleccionado.convertido_a_usuario ? '✅ Convertido' : '⏳ Pendiente'}
						</span>
					</div>
					
					{#if leadSeleccionado.primer_mensaje}
						<div class="detalle-item full-width">
							<strong>💭 Primer mensaje:</strong>
							<div class="mensaje-box">
								{leadSeleccionado.primer_mensaje}
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<div class="modal-footer">
				<button on:click={() => verConversaciones(leadSeleccionado)} class="btn-modal conversaciones">
					👁️ Ver Conversaciones
				</button>
				{#if leadSeleccionado.whatsapp}
					<a 
						href="https://wa.me/{leadSeleccionado.whatsapp.replace(/\D/g, '')}"
						target="_blank"
						class="btn-modal whatsapp"
					>
						📱 Contactar por WhatsApp
					</a>
				{/if}
				<button on:click={() => mostrarModal = false} class="btn-modal cerrar">
					Cerrar
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- 💬 Modal de conversaciones -->
{#if mostrarConversaciones && leadSeleccionado}
	<div class="modal-overlay" on:click={() => mostrarConversaciones = false}>
		<div class="modal-content modal-conversaciones" on:click|stopPropagation>
			<div class="modal-header">
				<h3>💬 Conversaciones - {leadSeleccionado.nombre}</h3>
				<button on:click={() => mostrarConversaciones = false} class="btn-cerrar">❌</button>
			</div>
			
			<div class="conversacion-container">
				{#if conversacionesActuales.length === 0}
					<div class="sin-conversaciones">
						<div class="empty-icon">📭</div>
						<h4>No hay conversaciones registradas</h4>
						<p>Este lead aún no ha tenido conversaciones guardadas en el sistema.</p>
					</div>
				{:else}
					<div class="mensajes-lista">
						{#each conversacionesActuales as mensaje}
							<div class="mensaje-item {mensaje.tipo_mensaje}">
								<div class="mensaje-header">
									<span class="tipo-badge {mensaje.tipo_mensaje}">
										{mensaje.tipo_mensaje === 'usuario' ? '👤' : mensaje.tipo_mensaje === 'bot' ? '🤖' : '🎧'} 
										{mensaje.tipo_mensaje.toUpperCase()}
									</span>
									<span class="timestamp">
										{formatearFecha(mensaje.created_at)}
									</span>
								</div>
								<div class="mensaje-contenido">
									{mensaje.mensaje}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
			
			<div class="modal-footer">
				<div class="conversacion-stats">
					<span class="stat-item">
						📊 {conversacionesActuales.length} mensajes
					</span>
					<span class="stat-item">
						💬 Chat ID: {leadSeleccionado.chat_id}
					</span>
				</div>
				<button on:click={() => mostrarConversaciones = false} class="btn-modal cerrar">
					Cerrar
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* 🎨 Estilos del dashboard con tema gaming */
	.dashboard-leads {
		min-height: 100vh;
		background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
		padding: 2rem;
		color: #e0e0ff;
		font-family: 'Inter', sans-serif;
	}

	.header-dashboard {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 15px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(138, 43, 226, 0.3);
	}

	.titulo-seccion h1 {
		font-size: 2.5rem;
		font-weight: 800;
		background: linear-gradient(45deg, #8a2be2, #ff6b6b);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin: 0;
	}

	.titulo-seccion p {
		margin: 0.5rem 0 0 0;
		opacity: 0.8;
	}

	.btn-actualizar {
		background: linear-gradient(45deg, #8a2be2, #6a5acd);
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 10px;
		color: white;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
	}

	.btn-actualizar:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(138, 43, 226, 0.4);
	}

	/* 📊 Grid de estadísticas */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.08);
		border-radius: 15px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}

	.stat-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	}

	.stat-card.total { border-left: 4px solid #3498db; }
	.stat-card.convertidos { border-left: 4px solid #2ecc71; }
	.stat-card.pendientes { border-left: 4px solid #f39c12; }
	.stat-card.conversion { border-left: 4px solid #e74c3c; }

	.stat-icon {
		font-size: 2.5rem;
		opacity: 0.8;
	}

	.stat-info h3 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		color: #fff;
	}

	.stat-info p {
		margin: 0;
		opacity: 0.7;
		font-size: 0.9rem;
	}

	/* 🔍 Panel de filtros */
	.filtros-panel {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 15px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		align-items: center;
	}

	.campo-busqueda {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		padding: 0.8rem 1rem;
		color: #fff;
		font-size: 1rem;
		width: 100%;
	}

	.campo-busqueda::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.filtros-container {
		display: flex;
		gap: 1rem;
	}

	.filtro-select {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		padding: 0.8rem;
		color: #fff;
		min-width: 180px;
	}

	.filtro-select option {
		background: #1a1a2e;
		color: #fff;
	}

	/* 📋 Tabla de leads */
	.tabla-container {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 15px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.tabla-leads {
		width: 100%;
		border-collapse: collapse;
	}

	.tabla-leads th {
		background: rgba(138, 43, 226, 0.2);
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.fila-lead {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}

	.fila-lead:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.fila-lead td {
		padding: 1rem;
		vertical-align: top;
	}

	.lead-info .lead-nombre {
		font-weight: 600;
		color: #fff;
	}

	.lead-info .lead-id {
		font-size: 0.8rem;
		opacity: 0.6;
		margin-top: 0.2rem;
	}

	.contacto-info .email {
		color: #fff;
		margin-bottom: 0.3rem;
	}

	.contacto-info .whatsapp {
		color: #25d366;
		font-size: 0.9rem;
	}

	.tipo-badge {
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		color: white;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		display: inline-block;
	}

	.estado-badge.convertido {
		background: linear-gradient(45deg, #2ecc71, #27ae60);
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		color: white;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.estado-badge.pendiente {
		background: linear-gradient(45deg, #f39c12, #e67e22);
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		color: white;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.celda-acciones {
		display: flex;
		gap: 0.5rem;
	}

	.btn-accion {
		padding: 0.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 35px;
		height: 35px;
	}

	.btn-accion.ver {
		background: rgba(52, 152, 219, 0.2);
		color: #3498db;
		border: 1px solid rgba(52, 152, 219, 0.3);
	}

	.btn-accion.whatsapp {
		background: rgba(37, 211, 102, 0.2);
		color: #25d366;
		border: 1px solid rgba(37, 211, 102, 0.3);
	}

	.btn-accion.chat {
		background: rgba(138, 43, 226, 0.2);
		color: #8a2be2;
		border: 1px solid rgba(138, 43, 226, 0.3);
	}

	.btn-accion:hover {
		transform: scale(1.1);
	}

	/* 📄 Paginación */
	.paginacion {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
		padding: 1rem;
	}

	.btn-pagina {
		background: rgba(138, 43, 226, 0.2);
		border: 1px solid rgba(138, 43, 226, 0.3);
		color: #8a2be2;
		padding: 0.8rem 1.2rem;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-pagina:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-pagina:hover:not(:disabled) {
		background: rgba(138, 43, 226, 0.3);
	}

	.info-pagina {
		font-weight: 600;
		color: #fff;
	}

	/* 🔄 Estados de carga */
	.loading-container {
		text-align: center;
		padding: 4rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.loading-spinner {
		width: 50px;
		height: 50px;
		border: 3px solid rgba(138, 43, 226, 0.3);
		border-top: 3px solid #8a2be2;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-state {
		text-align: center;
		padding: 4rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	/* 🔍 Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(5px);
	}

	.modal-content {
		background: linear-gradient(135deg, #1a1a2e, #16213e);
		border-radius: 20px;
		width: 90%;
		max-width: 600px;
		max-height: 80vh;
		overflow-y: auto;
		border: 1px solid rgba(138, 43, 226, 0.3);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.modal-header h3 {
		margin: 0;
		color: #fff;
		font-size: 1.5rem;
	}

	.btn-cerrar {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		color: #fff;
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	.btn-cerrar:hover {
		opacity: 1;
	}

	.modal-body {
		padding: 1.5rem;
	}

	.detalle-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.detalle-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.detalle-item.full-width {
		grid-column: 1 / -1;
	}

	.detalle-item strong {
		color: #8a2be2;
		font-size: 0.9rem;
	}

	.detalle-item span {
		color: #fff;
	}

	.chat-id {
		font-family: 'Monaco', 'Consolas', monospace;
		background: rgba(255, 255, 255, 0.1);
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		font-size: 0.8rem;
	}

	.mensaje-box {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 1rem;
		color: #fff;
		line-height: 1.5;
		margin-top: 0.5rem;
	}

	.modal-footer {
		display: flex;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		justify-content: flex-end;
	}

	.btn-modal {
		padding: 0.8rem 1.5rem;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-weight: 600;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.3s ease;
	}

	.btn-modal.conversaciones {
		background: linear-gradient(45deg, #8a2be2, #9932cc);
		color: white;
		border: 1px solid rgba(138, 43, 226, 0.3);
	}

	.btn-modal.whatsapp {
		background: linear-gradient(45deg, #25d366, #20bf55);
		color: white;
	}

	.btn-modal.cerrar {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.btn-modal:hover {
		transform: translateY(-2px);
	}

	/* 💬 Modal de conversaciones */
	.modal-conversaciones {
		max-width: 800px;
		max-height: 90vh;
	}

	.conversacion-container {
		max-height: 60vh;
		overflow-y: auto;
		padding: 1rem;
	}

	.sin-conversaciones {
		text-align: center;
		padding: 3rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.sin-conversaciones .empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.mensajes-lista {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.mensaje-item {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		padding: 1rem;
		border-left: 4px solid transparent;
	}

	.mensaje-item.usuario {
		border-left-color: #3498db;
		background: rgba(52, 152, 219, 0.1);
	}

	.mensaje-item.bot {
		border-left-color: #8a2be2;
		background: rgba(138, 43, 226, 0.1);
	}

	.mensaje-item.agente {
		border-left-color: #2ecc71;
		background: rgba(46, 204, 113, 0.1);
	}

	.mensaje-header {
		display: flex;
		justify-content: between;
		align-items: center;
		margin-bottom: 0.8rem;
		gap: 1rem;
	}

	.mensaje-header .tipo-badge {
		padding: 0.3rem 0.8rem;
		border-radius: 15px;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
	}

	.mensaje-header .tipo-badge.usuario {
		background: #3498db;
	}

	.mensaje-header .tipo-badge.bot {
		background: #8a2be2;
	}

	.mensaje-header .tipo-badge.agente {
		background: #2ecc71;
	}

	.mensaje-header .timestamp {
		font-size: 0.8rem;
		opacity: 0.6;
		margin-left: auto;
	}

	.mensaje-contenido {
		color: #fff;
		line-height: 1.5;
		word-wrap: break-word;
	}

	.conversacion-stats {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.stat-item {
		background: rgba(138, 43, 226, 0.2);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.8rem;
		color: #8a2be2;
		border: 1px solid rgba(138, 43, 226, 0.3);
	}

	/* 📱 Responsive */
	@media (max-width: 768px) {
		.dashboard-leads {
			padding: 1rem;
		}

		.header-dashboard {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.titulo-seccion h1 {
			font-size: 2rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.filtros-panel {
			grid-template-columns: 1fr;
		}

		.filtros-container {
			flex-direction: column;
		}

		.tabla-container {
			overflow-x: auto;
		}

		.detalle-grid {
			grid-template-columns: 1fr;
		}

		.modal-content {
			width: 95%;
			margin: 1rem;
		}

		.modal-footer {
			flex-direction: column;
		}
	}
</style> 