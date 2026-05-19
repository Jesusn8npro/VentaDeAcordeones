'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contextos/ContextoAutenticacion';
import ModalAutenticacionIsolado from '../../../componentes/autenticacion/ModalAutenticacionIsolado';
import { useRouter } from 'next/navigation';

const PaginaLogin = () => {
    const [modalAbierto, setModalAbierto] = useState(true);
    const { usuario, sesionInicializada } = useAuth();
    const router = useRouter();

    // Si ya hay usuario, redirigir
    useEffect(() => {
        if (sesionInicializada && usuario) {
            if (usuario.rol === 'admin') {
                router.push('/admin');
            } else {
                router.push('/perfil');
            }
        }
    }, [usuario, sesionInicializada, router]);

    return (
        <div className="pagina-login-contenedor" style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>
                    Iniciar Sesión
                </h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    Por favor, utiliza el modal para ingresar a tu cuenta.
                </p>
                <button
                    onClick={() => setModalAbierto(true)}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                    }}
                >
                    Abrir Modal de Ingreso
                </button>
            </div>

            <ModalAutenticacionIsolado
                abierto={modalAbierto}
                onCerrar={() => setModalAbierto(false)}
            />
        </div>
    );
};

export default PaginaLogin;
