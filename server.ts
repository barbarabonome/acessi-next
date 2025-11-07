import { createServer } from "http";
import { parse } from "url";
import next from "next";
import httpProxy from "http-proxy";

const port = parseInt(process.env.PORT || "3001", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const wsProxy = httpProxy.createProxyServer({
  target: "ws://localhost:5000",
  ws: true,
  changeOrigin: true,
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  });

  // Redirecionamento do WebSocket
  server.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith("/ws/")) {
      wsProxy.ws(req, socket, head);
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

// instalar dependências: npm install http-proxy @types/http-proxy --save-dev
