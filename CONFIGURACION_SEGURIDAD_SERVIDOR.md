# Configuración de Seguridad para el Servidor

## Headers de Seguridad Recomendados

Para tu servidor web (Nginx, Apache, etc.), agrega estos headers:

### Nginx Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name tudominio.com;
    
    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.epayco.co https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.epayco.co; frame-src https://*.epayco.co;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Hide server version
    server_tokens off;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
    }
    
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
    }
    
    # Static files
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName tudominio.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    SSLProtocol -all +TLSv1.2 +TLSv1.3
    SSLCipherSuite ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384
    
    # Security Headers
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.epayco.co https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.epayco.co; frame-src https://*.epayco.co;"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    
    # Hide server version
    ServerTokens Prod
    
    # Rate limiting
    <IfModule mod_security.c>
        SecAction "id:900000,phase:1,nolog,pass,initcol:ip=%{REMOTE_ADDR}"
        SecRule IP:bf_counter "@gt 5" "id:1000,phase:2,deny,status:429,msg:'Rate limit exceeded'"
        SecRule IP:bf_counter "@eq 6" "id:1001,phase:2,pass,setvar:ip.bf_counter=+1,expirevar:ip.bf_counter=300"
    </IfModule>
    
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
        
        # Cache static assets
        <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
            ExpiresActive On
            ExpiresDefault "access plus 1 year"
            Header set Cache-Control "public, immutable"
        </FilesMatch>
    </Directory>
</VirtualHost>
```

## Variables de Entorno Seguras

Asegúrate de configurar estas variables en tu servidor:

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EPAYCO_PUBLIC_KEY=your-epayco-public-key
VITE_EPAYCO_PRIVATE_KEY=your-epayco-private-key
VITE_URL_BASE=https://tudominio.com
VITE_DEBUG=false
VITE_ENVIRONMENT=production
```

## Configuración de Supabase

### Row Level Security (RLS)
Asegúrate de habilitar RLS en todas las tablas:

```sql
-- Habilitar RLS en tablas críticas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas
CREATE POLICY "Productos visibles para todos" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "Usuarios solo pueden ver su propio perfil" ON usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Pedidos solo del usuario" ON pedidos FOR ALL USING (auth.uid() = usuario_id);
```

### Funciones Seguras
```sql
-- Función segura para obtener usuario
CREATE OR REPLACE FUNCTION obtener_usuario_actual()
RETURNS TABLE (
  id uuid,
  email text,
  nombre text,
  rol text
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.nombre, u.rol
  FROM usuarios u
  WHERE u.id = auth.uid() AND u.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para auditoría
CREATE TABLE auditoria (
  id BIGSERIAL PRIMARY KEY,
  tabla TEXT NOT NULL,
  operacion TEXT NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  fecha TIMESTAMP DEFAULT NOW(),
  ip INET
);
```

## Monitoreo y Alertas

### Configurar alertas en Supabase
1. Ve a Settings > API > Usage
2. Configura límites para:
   - Database queries per second
   - Auth requests per minute
   - Storage operations per hour

### Logs de seguridad
Implementa logging de eventos críticos:
- Intentos de login fallidos
- Cambios en datos sensibles
- Accesos no autorizados
- Errores de validación

## Backup y Recuperación

### Backups automáticos
```bash
# Script de backup diario
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/supabase"

# Backup de base de datos
pg_dump $SUPABASE_DB_URL > "$BACKUP_DIR/supabase_$DATE.sql"

# Backup de storage (si aplica)
aws s3 sync s3://your-bucket "$BACKUP_DIR/storage/"

# Mantener solo últimos 7 días
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
```

### Test de restauración
Realiza pruebas mensuales de restauración de backups para asegurar que funcionan correctamente.