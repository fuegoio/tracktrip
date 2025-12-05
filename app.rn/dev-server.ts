import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:3000/api",
    changeOrigin: true,
  }),
);

app.use(
  "/",
  createProxyMiddleware({
    target: "http://localhost:8081",
    changeOrigin: true,
    pathFilter: ["!**/api/**"],
  }),
);

console.log("Proxy server running on http://localhost:8000");
app.listen(8000);
