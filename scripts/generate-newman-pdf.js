const fs = require('fs');
const path = require('path');

const resultsFile = path.join(__dirname, '..', 'teste_api', 'reports', 'results.json');
const outputFile = path.join(__dirname, '..', 'teste_api', 'reports', 'summary.html');

if (!fs.existsSync(resultsFile)) {
  console.error('ERROR: results.json not found at', resultsFile);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const stats = data.run.stats;
const failures = data.run.failures || [];

const total = stats.assertions.total;
const failed = stats.assertions.failed;
const passed = total - failed;
const totalRequests = stats.requests.total;
const isPass = failed === 0;

const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const failRows = failures.map(f => `<tr>
  <td>${esc(f.source?.name || '-')}</td>
  <td>${esc(f.error?.test || '-')}</td>
  <td class="err">${esc(f.error?.message || '-')}</td>
</tr>`).join('');

const failSection = failures.length > 0
  ? `<h2 class="title-fail">Falhas (${failures.length})</h2>
     <table>
       <thead><tr><th>Request</th><th>Asserção</th><th>Mensagem de erro</th></tr></thead>
       <tbody>${failRows}</tbody>
     </table>`
  : `<p class="all-pass">✅ Todas as asserções passaram sem falhas.</p>`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Newman — Resumo</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;color:#222;padding:32px;background:#fff;font-size:13px}
  h1{font-size:18px;color:#1a237e;border-bottom:3px solid #1a237e;padding-bottom:8px;margin-bottom:6px}
  .meta{font-size:11px;color:#888;margin-bottom:18px}
  .badge{display:inline-block;padding:5px 14px;border-radius:4px;font-size:15px;font-weight:bold;margin-bottom:18px}
  .badge.pass{background:#e8f5e9;color:#2e7d32;border:1px solid #2e7d32}
  .badge.fail{background:#ffebee;color:#c62828;border:1px solid #c62828}
  .stats{display:flex;gap:14px;margin-bottom:22px;flex-wrap:wrap}
  .stat{border:1px solid #ddd;border-radius:6px;padding:12px 18px;text-align:center;min-width:80px}
  .stat .num{font-size:26px;font-weight:bold}
  .stat .lbl{font-size:10px;color:#888;margin-top:2px}
  .stat.p .num{color:#2e7d32}
  .stat.f .num{color:#c62828}
  .title-fail{font-size:14px;color:#c62828;margin:18px 0 8px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#1a237e;color:#fff;padding:8px 10px;text-align:left}
  td{padding:7px 10px;border-bottom:1px solid #eee;vertical-align:top}
  tr:nth-child(even) td{background:#fafafa}
  .err{font-family:monospace;font-size:11px;color:#c62828;white-space:pre-wrap;word-break:break-all}
  .all-pass{color:#2e7d32;font-weight:bold;margin-top:10px}
  .footer{margin-top:28px;font-size:10px;color:#bbb;border-top:1px solid #eee;padding-top:6px}
</style>
</head>
<body>
  <h1>Newman API Tests — Restful-Booker</h1>
  <div class="meta">Gerado em ${date} (BRT)</div>
  <div class="badge ${isPass ? 'pass' : 'fail'}">${isPass ? '✅ PASSOU' : '❌ FALHOU'}</div>
  <div class="stats">
    <div class="stat"><div class="num">${totalRequests}</div><div class="lbl">Requests</div></div>
    <div class="stat"><div class="num">${total}</div><div class="lbl">Asserções</div></div>
    <div class="stat p"><div class="num">${passed}</div><div class="lbl">Passou</div></div>
    <div class="stat f"><div class="num">${failed}</div><div class="lbl">Falhou</div></div>
  </div>
  ${failSection}
  <div class="footer">BeTalent QA · Newman · Restful-Booker</div>
</body>
</html>`;

fs.writeFileSync(outputFile, html, 'utf8');
console.log('Newman summary HTML written to', outputFile);
