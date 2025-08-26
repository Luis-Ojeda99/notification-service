const request = require("supertest");
const app = require("../src/app");

describe("Health Check", () => {
  it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBeDefined();
  });
});