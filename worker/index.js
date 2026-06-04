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

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
