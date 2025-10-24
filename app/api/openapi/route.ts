import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Trendify API",
      version: "1.1.0",
      description: "Public API specification for Trendify e-commerce platform",
    },
    servers: [{ url: "/" }],
    paths: {
      "/api/products": {
        get: {
          summary: "List products",
          responses: {
            "200": { description: "OK" },
          },
        },
      },
      "/api/products/{id}": {
        get: {
          summary: "Get product details",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "OK" },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/cart/sync": {
        get: {
          summary: "Get authenticated user cart",
          responses: { "200": { description: "OK" } },
        },
        post: {
          summary: "Merge guest cart into authenticated cart",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    guestCartItems: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CartItem" },
                    },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Merged" } },
        },
      },
      "/api/checkout/guest": {
        post: {
          summary: "Create a guest checkout session",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/GuestCheckoutRequest" } } },
          },
          responses: { "201": { description: "Created" } },
        },
      },
      "/api/stock-alerts": {
        post: {
          summary: "Subscribe to back-in-stock alerts",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/StockAlertRequest" } } },
          },
          responses: { "201": { description: "Created" }, "400": { description: "Bad Request" } },
        },
        delete: {
          summary: "Unsubscribe from stock alerts",
          parameters: [
            { name: "email", in: "query", required: true, schema: { type: "string", format: "email" } },
            { name: "productId", in: "query", required: true, schema: { type: "string" } },
          ],
          responses: { "200": { description: "Deleted" } },
        },
      },
      "/api/returns": {
        get: { summary: "List returns", responses: { "200": { description: "OK" } } },
        post: { summary: "Create a return", responses: { "201": { description: "Created" } } },
      },
      "/api/returns/{id}": {
        get: { summary: "Get a return", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" }, "404": { description: "Not found" } } },
        patch: { summary: "Update a return", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Updated" } } },
      },
    },
    components: {
      schemas: {
        CartItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            quantity: { type: "integer" },
            color: { type: "string" },
            size: { type: "string" },
            image: { type: "string" },
          },
          required: ["id", "name", "price", "quantity", "image"],
        },
        StockAlertRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            productId: { type: "string" },
            variantId: { type: "string" },
          },
          required: ["email", "productId"],
        },
        GuestCheckoutRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            items: {
              type: "array",
              items: { type: "object", properties: { productId: { type: "string" }, quantity: { type: "integer" } }, required: ["productId", "quantity"] },
            },
            shippingAddress: { type: "object" },
          },
          required: ["email", "items", "shippingAddress"],
        },
        ApiResponse: {
          type: "object",
          properties: {
            data: {},
            error: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "object" }] },
          },
        },
      },
    },
  }

  return NextResponse.json(spec)
}
