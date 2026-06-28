export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const apiKey = request.headers.get('X-API-Key') || url.searchParams.get('key');

    // GET / - 管理首页
    if (request.method === 'GET' && url.pathname === '/') {
      const html = `<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Canvas Academy Admin</title><style>body{font-family:monospace;background:#131313;color:#abb2bf;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}.card{background:#1e222a;border:2px solid #3e4451;border-radius:16px;padding:40px;text-align:center;box-shadow:0_20px_50px_rgba(0,0,0,.6)}h1{color:#e5c07b;font-size:20px;margin-bottom:20px}.inp{background:#2c313a;color:#abb2bf;border:2px solid #3e4451;padding:10px 16px;font-size:14px;font-family:monospace;border-radius:8px;width:280px;text-align:center;outline:none;margin-bottom:16px}.inp:focus{border-color:#98c379}.btn{display:inline-block;background:#98c379;color:#131313;border:none;padding:12px 32px;font-size:16px;font-weight:bold;border-radius:8px;cursor:pointer;border-bottom:4px solid #689d4a;transition:all .15s}.btn:hover{background:#b1e085;border-bottom-color:#7ab85a}.btn:active{transform:translateY(2px);border-bottom-width:2px}.hint{color:#5c6370;font-size:12px;margin-top:16px}</style></head><body><div class="card"><h1>Canvas Academy Admin</h1><input id="key" class="inp" type="password" placeholder="Paste API Key" autofocus><br><button class="btn" onclick="const k=document.getElementById('key').value;if(!k){alert('Please enter API Key');return;}location.href='/api/agents/export?key='+encodeURIComponent(k)">Download agents.csv</button>
<button class="btn" style="background:#56b6c2;border-bottom-color:#3a7a82;margin-left:8px" onclick="const k=document.getElementById('key').value;if(!k){alert('Please enter API Key');return;}fetch('/api/feedback?key='+encodeURIComponent(k)).then(r=>r.json()).then(d=>{const w=window.open('','_blank','width=800,height=600');w.document.write('<html><head><meta charset=utf-8><title>Feedback</title><style>body{font-family:monospace;background:#131313;color:#abb2bf;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #3e4451;padding:8px 12px;text-align:left;font-size:13px}th{background:#1e222a;color:#e5c07b}tr:nth-child(even){background:#1e222a}</style></head><body><h1 style=color:#e5c07b>Feedback</h1><table><tr><th>ID</th><th>Name</th><th>Message</th><th>Time</th></tr>'+d.map(r=>'<tr><td>'+r.id+'</td><td>'+r.name+'</td><td>'+r.message+'</td><td>'+r.created_at+'</td></tr>').join('')+'</table></body></html>');w.document.close()}).catch(()=>alert('Failed to fetch'))">View Feedback</button><div class="hint">Enter API Key to download agent records as CSV</div></div></body></html>`;
      return new Response(html, { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // POST /api/feedback — 公开提交反馈（无需 API Key，放在 auth gate 之前）
    if (request.method === 'POST' && url.pathname === '/api/feedback') {
      try {
        const { name, message } = await request.json();
        if (!message || !message.trim()) {
          return Response.json({ error: 'Message required' }, { status: 400, headers: corsHeaders });
        }
        await env.DB.prepare(
          'INSERT INTO feedback (name, message, created_at) VALUES (?, ?, datetime(\'now\', \'+8 hours\'))'
        ).bind(name || '匿名', message.trim()).run();
        return Response.json({ success: true }, { headers: corsHeaders });
      } catch (e) {
        return Response.json({ error: 'Server error' }, { status: 500, headers: corsHeaders });
      }
    }

    if (apiKey !== env.API_KEY) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    // GET /api/agents/export - 导出 CSV
    if (request.method === 'GET' && url.pathname === '/api/agents/export') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM agents ORDER BY created_at DESC'
      ).all();
      const header = 'id,name,emp_id,dept,created_at';
      const rows = results.map(r =>
        `${r.id},"${r.name}","${r.emp_id}","${r.dept}","${r.created_at}"`
      );
      const csv = [header, ...rows].join('\n');
      return new Response(csv, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="agents.csv"',
        },
      });
    }

    // GET /api/agents - 查询所有学员记录
    if (request.method === 'GET' && url.pathname === '/api/agents') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM agents ORDER BY created_at DESC LIMIT 100'
      ).all();
      return Response.json(results, { headers: corsHeaders });
    }

    // POST /api/agents - 写入新学员记录
    if (request.method === 'POST' && url.pathname === '/api/agents') {
      const { name, empId, dept } = await request.json();
      if (!name || !empId || !dept) {
        return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
      }
      await env.DB.prepare(
        'INSERT INTO agents (name, emp_id, dept) VALUES (?, ?, ?)'
      ).bind(name, empId, dept).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // GET /api/feedback — 查询反馈列表（需 API Key）
    if (request.method === 'GET' && url.pathname === '/api/feedback') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM feedback ORDER BY created_at DESC LIMIT 200'
      ).all();
      return Response.json(results, { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
