import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 4100);
const E2E_TOKEN = "e2e-token";
const CLIENT_TOKEN = "e2e-client-token";

const adminUser = {
  id: "e2e-admin",
  name: "Admin E2E",
  username: "Admin E2E",
  email: "test@email.com",
  role: "ADMIN",
};

const clientUser = {
  id: "e2e-client",
  name: "Cliente Teste",
  username: "Cliente Teste",
  email: "client@email.com",
  role: "CLIENT",
};

const users = [
  {
    id: "e2e-admin",
    username: "Admin E2E",
    email: "test@email.com",
    role: "ADMIN",
    is_active: true,
    created_at: "2026-11-01T10:00:00.000Z",
    updated_at: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "e2e-user-1",
    username: "Usuario Comum",
    email: "user@email.com",
    role: "USER",
    is_active: true,
    created_at: "2026-11-02T10:00:00.000Z",
    updated_at: "2026-11-02T10:00:00.000Z",
  },
  {
    id: "e2e-client",
    username: "Cliente Teste",
    email: "client@email.com",
    role: "CLIENT",
    is_active: true,
    created_at: "2026-11-03T10:00:00.000Z",
    updated_at: "2026-11-03T10:00:00.000Z",
  },
];

const tickets = [
  {
    id: "e2e-1",
    title: "Chamado de teste E2E",
    description: "Chamado retornado pelo mock usado nos testes.",
    status: "OPEN",
    priority: "HIGH",
    requester: clientUser,
    assigned_to: null,
    created_at: "2026-11-12T10:00:00.000Z",
    updated_at: "2026-11-12T10:00:00.000Z",
  },
  {
    id: "e2e-2",
    title: "Solicitação do departamento financeiro",
    description: "Acesso ao relatório anual do financeiro.",
    status: "CLOSED",
    priority: "LOW",
    requester: adminUser,
    assigned_to: null,
    created_at: "2026-11-10T10:00:00.000Z",
    updated_at: "2026-11-11T10:00:00.000Z",
  },
  {
    id: "e2e-3",
    title: "Problema na impressora do setor",
    description: "Impressora não responde aos comandos de impressão.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    requester: clientUser,
    assigned_to: null,
    created_at: "2026-11-09T10:00:00.000Z",
    updated_at: "2026-11-10T10:00:00.000Z",
  },
  {
    id: "e2e-detail",
    title: "Chamado dedicado ao teste de edição",
    description: "Usado pelo teste de detalhes/atualização do chamado.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    requester: clientUser,
    assigned_to: null,
    created_at: "2026-11-08T10:00:00.000Z",
    updated_at: "2026-11-08T10:00:00.000Z",
  },
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Accept,Authorization,Content-Type",
  "Access-Control-Max-Age": "86400",
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    ...corsHeaders,
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function userForToken(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token === E2E_TOKEN) return adminUser;
  if (token === CLIENT_TOKEN) return clientUser;
  return null;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && path === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && path === "/auth/login") {
      const body = await readBody(request);
      if (body.email === "test@email.com" && body.password === "123456") {
        sendJson(response, 200, { token: E2E_TOKEN });
        return;
      }
      if (body.email === "client@email.com" && body.password === "123456") {
        sendJson(response, 200, { token: CLIENT_TOKEN });
        return;
      }

      sendJson(response, 401, { message: "Credenciais inválidas." });
      return;
    }

    if (request.method === "POST" && path === "/auth/register") {
      await readBody(request);
      sendJson(response, 201, { message: "Usuário criado com sucesso." });
      return;
    }

    if (request.method === "GET" && path === "/auth/me") {
      const user = userForToken(request);
      if (!user) {
        sendJson(response, 401, { message: "Não autorizado." });
        return;
      }

      sendJson(response, 200, user);
      return;
    }

    if (request.method === "GET" && path === "/auth/users") {
      if (!userForToken(request)) {
        sendJson(response, 401, { message: "Não autorizado." });
        return;
      }

      sendJson(response, 200, users);
      return;
    }

    if (request.method === "POST" && path === "/auth/logout") {
      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === "POST" && path === "/auth/updaterole") {
      if (!userForToken(request)) {
        sendJson(response, 401, { message: "Não autorizado." });
        return;
      }

      const body = await readBody(request);
      const target = users.find((user) => user.id === body.userId);
      if (target) target.role = body.role;
      sendJson(response, 200, { success: true });
      return;
    }

    if (request.method === "GET" && path === "/tickets") {
      if (!userForToken(request)) {
        sendJson(response, 401, { message: "Não autorizado." });
        return;
      }

      sendJson(response, 200, {
        data: tickets,
        meta: {
          total: tickets.length,
          lastPage: 1,
          currentPage: 1,
          perPage: 10,
          prev: null,
          next: null,
        },
      });
      return;
    }

    const ticketMatch = path.match(/^\/tickets\/([^/]+)$/);

    if (request.method === "GET" && ticketMatch) {
      if (!userForToken(request)) {
        sendJson(response, 401, { message: "Não autorizado." });
        return;
      }

      const ticket = tickets.find(
        (item) => item.id === decodeURIComponent(ticketMatch[1]),
      );
      if (!ticket) {
        sendJson(response, 404, { message: "Chamado não encontrado." });
        return;
      }

      sendJson(response, 200, ticket);
      return;
    }

    if (request.method === "PATCH" && ticketMatch) {
      if (!userForToken(request)) {
        sendJson(response, 401, { message: "Não autorizado." });
        return;
      }

      const ticket = tickets.find(
        (item) => item.id === decodeURIComponent(ticketMatch[1]),
      );
      if (!ticket) {
        sendJson(response, 404, { message: "Chamado não encontrado." });
        return;
      }

      const body = await readBody(request);
      for (const field of ["title", "description", "status", "priority"]) {
        if (body[field] !== undefined) ticket[field] = body[field];
      }
      ticket.updated_at = new Date().toISOString();
      sendJson(response, 200, ticket);
      return;
    }

    if (request.method === "POST" && path === "/tickets") {
      if (!userForToken(request)) {
        sendJson(response, 401, { message: "Não autorizado." });
        return;
      }

      const body = await readBody(request);
      const now = new Date().toISOString();
      const ticket = {
        id: `e2e-${tickets.length + 1}-${Date.now()}`,
        title: body.title ?? "",
        description: body.description ?? "",
        status: "OPEN",
        priority: "MEDIUM",
        requester: userForToken(request),
        assigned_to: null,
        created_at: now,
        updated_at: now,
      };
      tickets.unshift(ticket);
      sendJson(response, 201, ticket);
      return;
    }

    if (request.method === "POST" && path === "/chat") {
      sendJson(response, 200, { reply: "Resposta simulada do chat E2E." });
      return;
    }

    sendJson(response, 404, { message: "Rota não encontrada." });
  } catch {
    sendJson(response, 400, { message: "Requisição inválida." });
  }
});

server.listen(PORT, () => {
  console.log(`Mock API E2E ouvindo em http://localhost:${PORT}`);
});
