import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env.ts";
import { errorHandler } from "./error-handler.ts";
import { createLink } from "./http/create-link.ts";
import { getLink } from "./http/get-link.ts";
import { getLinks } from "./http/get-links.ts";
import { getLinksMetrics } from "./http/get-links-metrics.ts";

export const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(errorHandler);

if (env.NODE_ENV === "prod") {
  await app.register(import("@fastify/swagger"), {
    openapi: {
      info: {
        title: "FastFeet Auth Api Docs",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(import("@scalar/fastify-api-reference"), {
    routePrefix: "/docs",
  });
}

app.register(createLink);
app.register(getLinks);
app.register(getLink);
app.register(getLinksMetrics);
