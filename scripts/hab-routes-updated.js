// ============================================
// ROTAS API CNH (Telas CNH) - Next.js
// Porta: 3005 | PM2: multihab | Pasta: /var/www/multihab
// ATUALIZADO: Usa tenants.json (sem rebuild obrigatório)
// ============================================

const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const CNH_PORT = 3005;
const BACKEND_IP = '38.180.196.242';
const CNH_PATH = '/var/www/multihab';
const PM2_NAME = 'multihab';

// Status do rebuild CNH para consulta do frontend
let cnhRebuildStatus = {
  building: false,
  lastStarted: null,
  lastCompleted: null,
  lastError: null,
  triggeredBy: null,
  logs: []
};

module.exports = function(app, io, pool, logDomain, pendingDomains) {

  // Função helper para iniciar rebuild com streaming de logs via WebSocket
  function startCnhRebuild(triggeredBy) {
    cnhRebuildStatus = {
      building: true,
      lastStarted: new Date().toISOString(),
      lastCompleted: null,
      lastError: null,
      triggeredBy: triggeredBy,
      logs: []
    };

    const emitLog = (type, message) => {
      const logEntry = { time: new Date().toISOString(), type, message };
      cnhRebuildStatus.logs.push(logEntry);
      io.emit('cnh-rebuild-log', logEntry);
      console.log('[CNH] ' + message);
    };

    emitLog('info', '🔄 Iniciando rebuild CNH - ' + triggeredBy);
    io.emit('cnh-rebuild-start', { triggeredBy, startedAt: cnhRebuildStatus.lastStarted });

    const sshProcess = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      'root@' + BACKEND_IP,
      `cd ${CNH_PATH} && rm -rf .next && npm run build 2>&1 && pm2 restart ${PM2_NAME}`
    ]);

    sshProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      lines.forEach(line => {
        if (line.includes('Compiling') || line.includes('compiled') ||
            line.includes('Building') || line.includes('Generating') ||
            line.includes('Route') || line.includes('✓') || line.includes('○') ||
            line.includes('Error') || line.includes('error') || line.includes('ƒ')) {
          emitLog('build', line.trim());
        }
      });
    });

    sshProcess.stderr.on('data', (data) => {
      emitLog('error', data.toString().trim());
    });

    sshProcess.on('close', (code) => {
      cnhRebuildStatus.building = false;
      if (code === 0) {
        cnhRebuildStatus.lastCompleted = new Date().toISOString();
        emitLog('success', '✅ Rebuild CNH concluído com sucesso!');
        io.emit('cnh-rebuild-complete', { success: true, completedAt: cnhRebuildStatus.lastCompleted });
      } else {
        cnhRebuildStatus.lastError = 'Exit code: ' + code;
        emitLog('error', '❌ Rebuild falhou com código: ' + code);
        io.emit('cnh-rebuild-complete', { success: false, error: cnhRebuildStatus.lastError });
      }
    });

    return cnhRebuildStatus;
  }

  // GET status do rebuild CNH
  app.get('/api/cnh/rebuild-status', (req, res) => {
    res.json(cnhRebuildStatus);
  });

  // POST força rebuild manual
  app.post('/api/cnh/rebuild', (req, res) => {
    if (cnhRebuildStatus.building) {
      return res.status(409).json({
        success: false,
        error: 'Rebuild já em andamento',
        status: cnhRebuildStatus
      });
    }
    startCnhRebuild('manual');
    res.json({ success: true, message: 'Rebuild iniciado', status: cnhRebuildStatus });
  });

  // ============================================
  // ROTAS DE TENANT (tenants.json - SEM REBUILD)
  // ============================================

  // GET listar todos os tenants CNH
  app.get('/api/cnh/tenants', async (req, res) => {
    try {
      const cmd = `ssh -o StrictHostKeyChecking=no root@${BACKEND_IP} "python3 /usr/local/bin/cnh-tenant-manager.py list"`;
      const { stdout } = await execPromise(cmd);
      res.json(JSON.parse(stdout));
    } catch (error) {
      console.error('Erro listar tenants cnh:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET config de um tenant específico
  app.get('/api/cnh/tenant/:domain', async (req, res) => {
    try {
      const { domain } = req.params;
      const cmd = `ssh -o StrictHostKeyChecking=no root@${BACKEND_IP} "python3 /usr/local/bin/cnh-tenant-manager.py get '${domain}'"`;
      const { stdout } = await execPromise(cmd);
      res.json(JSON.parse(stdout));
    } catch (error) {
      console.error('Erro get tenant cnh:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST adicionar tenant (apenas no tenants.json - sem rebuild)
  app.post('/api/cnh/tenant', async (req, res) => {
    try {
      const { domain, layout = 'a', googleAdsId = '', googleAdsConversionLabel = '' } = req.body;
      
      if (!domain) {
        return res.status(400).json({ success: false, error: 'domain é obrigatório' });
      }

      const cmd = `ssh -o StrictHostKeyChecking=no root@${BACKEND_IP} "python3 /usr/local/bin/cnh-tenant-manager.py add '${domain}' '${layout}' '${googleAdsId}' '${googleAdsConversionLabel}'"`;
      const { stdout } = await execPromise(cmd);
      res.json(JSON.parse(stdout));
    } catch (error) {
      console.error('Erro add tenant cnh:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT atualizar tenant (apenas no tenants.json - sem rebuild)
  app.put('/api/cnh/tenant/:domain', async (req, res) => {
    try {
      const { domain } = req.params;
      const { layout, googleAdsId, googleAdsConversionLabel } = req.body;
      
      const results = [];

      // Atualiza cada campo fornecido
      if (layout !== undefined) {
        const cmd = `ssh -o StrictHostKeyChecking=no root@${BACKEND_IP} "python3 /usr/local/bin/cnh-tenant-manager.py update '${domain}' 'layout' '${layout}'"`;
        const { stdout } = await execPromise(cmd);
        results.push({ field: 'layout', result: JSON.parse(stdout) });
      }

      if (googleAdsId !== undefined) {
        const cmd = `ssh -o StrictHostKeyChecking=no root@${BACKEND_IP} "python3 /usr/local/bin/cnh-tenant-manager.py update '${domain}' 'googleAdsId' '${googleAdsId}'"`;
        const { stdout } = await execPromise(cmd);
        results.push({ field: 'googleAdsId', result: JSON.parse(stdout) });
      }

      if (googleAdsConversionLabel !== undefined) {
        const cmd = `ssh -o StrictHostKeyChecking=no root@${BACKEND_IP} "python3 /usr/local/bin/cnh-tenant-manager.py update '${domain}' 'googleAdsConversionLabel' '${googleAdsConversionLabel}'"`;
        const { stdout } = await execPromise(cmd);
        results.push({ field: 'googleAdsConversionLabel', result: JSON.parse(stdout) });
      }

      res.json({ success: true, domain, updates: results });
    } catch (error) {
      console.error('Erro update tenant cnh:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE remover tenant
  app.delete('/api/cnh/tenant/:domain', async (req, res) => {
    try {
      const { domain } = req.params;
      const cmd = `ssh -o StrictHostKeyChecking=no root@${BACKEND_IP} "python3 /usr/local/bin/cnh-tenant-manager.py remove '${domain}'"`;
      const { stdout } = await execPromise(cmd);
      res.json(JSON.parse(stdout));
    } catch (error) {
      console.error('Erro remover tenant cnh:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ============================================
  // SETUP COMPLETO DE DOMÍNIO CNH
  // (nginx + tenants.json - SEM REBUILD AUTOMÁTICO)
  // ============================================
  
  app.post('/api/cnh/setup', async (req, res) => {
    const { domain, frontend_ip, adsId = '', adsLabel = '', name = 'CNH Social', layout = 'a' } = req.body;
    const logs = [];

    if (!domain || !frontend_ip) {
      return res.status(400).json({ success: false, error: 'domain e frontend_ip são obrigatórios' });
    }

    const backendIp = BACKEND_IP;

    try {
      logs.push('═══════════════════════════════════════');
      logs.push(`🪪 INICIANDO SETUP CNH: ${domain}`);
      logs.push('═══════════════════════════════════════');

      // ========== ETAPA 1: FRONTEND - proxy_pass ==========
      logs.push('');
      logs.push('🌐 [1/3] Configurando proxy no frontend...');
      try {
        const checkProxyCmd = `ssh -o StrictHostKeyChecking=no root@${frontend_ip} "grep -l '${domain}' /etc/nginx/sites-enabled/* 2>/dev/null || echo 'NOT_FOUND'"`;
        const { stdout: proxyCheck } = await execPromise(checkProxyCmd);

        if (proxyCheck.trim() === 'NOT_FOUND') {
          const proxyCmd = `ssh -o StrictHostKeyChecking=no root@${frontend_ip} "cat >> /etc/nginx/sites-enabled/multihab-proxy << 'EOFPROXY'

# ${domain} - CNH
server {
    listen 80;
    server_name ${domain};
    location / {
        proxy_pass http://${backendIp}:80;
        proxy_http_version 1.1;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
    }
}
EOFPROXY
nginx -t && systemctl reload nginx && echo 'PROXY_OK' || echo 'PROXY_ERROR'"`;

          const { stdout: proxyResult } = await execPromise(proxyCmd);
          if (proxyResult.includes('PROXY_OK')) {
            logs.push(`✅ Proxy configurado: ${frontend_ip} → ${backendIp}`);
          } else {
            logs.push('⚠️ Possível erro no proxy: ' + proxyResult.trim());
          }
        } else {
          logs.push('✅ Proxy já existe no frontend');
        }
      } catch (e) {
        logs.push(`❌ Erro proxy: ${e.message}`);
      }

      // ========== ETAPA 2: BACKEND - cnh-domains.conf ==========
      logs.push('');
      logs.push('📝 [2/3] Adicionando ao cnh-domains.conf...');
      try {
        const nginxCheckCmd = `ssh -o StrictHostKeyChecking=no root@${backendIp} "grep '${domain}' /etc/nginx/conf.d/cnh-domains.conf 2>/dev/null || echo 'NOT_FOUND'"`;
        const { stdout: nginxCheck } = await execPromise(nginxCheckCmd);

        if (nginxCheck.trim() === 'NOT_FOUND') {
          const nginxAddCmd = `ssh -o StrictHostKeyChecking=no root@${backendIp} "cat >> /etc/nginx/conf.d/cnh-domains.conf << 'EOFNGINX'

# ${domain} - Adicionado automaticamente
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:${CNH_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \\$http_upgrade;
    }
}
EOFNGINX
nginx -t && systemctl reload nginx && echo 'NGINX_OK' || echo 'NGINX_ERROR'"`;

          const { stdout: nginxResult } = await execPromise(nginxAddCmd);
          if (nginxResult.includes('NGINX_OK')) {
            logs.push(`✅ Domínio adicionado ao cnh-domains.conf → localhost:${CNH_PORT}`);
          } else {
            logs.push('⚠️ Possível erro no nginx backend: ' + nginxResult.trim());
          }
        } else {
          logs.push('✅ Domínio já existe no cnh-domains.conf');
        }
      } catch (e) {
        logs.push(`❌ Erro cnh-domains.conf: ${e.message}`);
      }

      // ========== ETAPA 3: tenants.json (SEM REBUILD!) ==========
      logs.push('');
      logs.push('📝 [3/3] Adicionando ao tenants.json...');
      try {
        const addCmd = `ssh -o StrictHostKeyChecking=no root@${backendIp} "python3 /usr/local/bin/cnh-tenant-manager.py add '${domain}' '${layout}' '${adsId}' '${adsLabel}'"`;
        const { stdout: addResult } = await execPromise(addCmd);

        try {
          const result = JSON.parse(addResult);
          if (result.success) {
            logs.push(`✅ Domínio ${result.action || 'adicionado'} no tenants.json`);
          } else {
            logs.push('⚠️ ' + (result.error || 'Erro desconhecido'));
          }
        } catch (e) {
          logs.push('✅ ' + addResult.trim());
        }
      } catch (e) {
        logs.push(`❌ Erro tenants.json: ${e.message}`);
      }

      // ========== RESUMO (SEM BUILD!) ==========
      logs.push('');
      logs.push('═══════════════════════════════════════');
      logs.push(`🪪 SETUP CNH COMPLETO: ${domain}`);
      logs.push(`🔗 URL: https://${domain}`);
      logs.push('');
      logs.push('📋 Configurado:');
      logs.push(`   Frontend ${frontend_ip} → proxy_pass http://${backendIp}:80`);
      logs.push(`   Backend nginx (cnh-domains.conf) → localhost:${CNH_PORT}`);
      logs.push(`   tenants.json → layout: ${layout}`);
      logs.push('');
      logs.push('✅ NÃO PRECISA DE REBUILD! Funciona imediatamente.');
      logs.push('═══════════════════════════════════════');

      // Atualizar status no banco
      try {
        if (pool) {
          await pool.query(
            "UPDATE pending_domains_history SET status = 'completed', category = 'cnh', completed_at = NOW() WHERE domain = $1",
            [domain]
          );
          logs.push('✅ Status atualizado no banco!');

          if (pendingDomains && pendingDomains.has(domain)) {
            pendingDomains.delete(domain);
          }
        }
      } catch (e) {
        logs.push('⚠️ Erro ao atualizar banco: ' + e.message);
      }

      // Salvar log
      if (logDomain) {
        const fullDetails = {
          logs: logs,
          frontend_ip: frontend_ip,
          backend_ip: backendIp,
          category: 'cnh',
          pasta: 'multihab',
          port: CNH_PORT,
          layout: layout,
          completed_at: new Date().toISOString()
        };
        await logDomain(domain, 'setup_cnh', 'success', logs.join('\n'), fullDetails, frontend_ip, 'multihab');
      }

      // WebSocket
      io.emit('domain_setup_complete', { domain, status: 'completed', pasta: 'multihab', category: 'cnh' });

      res.json({
        success: true,
        message: `Domínio ${domain} configurado para CNH!`,
        domain,
        frontend_ip,
        backend_ip: backendIp,
        port: CNH_PORT,
        layout,
        logs
      });

    } catch (error) {
      logs.push(`❌ ERRO FATAL: ${error.message}`);
      console.error('Erro setup-cnh:', error);

      if (logDomain) {
        await logDomain(domain, 'setup_cnh', 'error', error.message, { logs, frontend_ip, stack: error.stack }, frontend_ip, 'multihab');
      }

      res.status(500).json({ success: false, error: error.message, logs });
    }
  });

  console.log('🪪 Rotas CNH (Telas CNH) carregadas - Porta ' + CNH_PORT + ' [tenants.json - SEM REBUILD]');
};
