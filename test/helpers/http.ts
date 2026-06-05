import { mock } from "bun:test";

export function createResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status: mock((code: number) => {
      response.statusCode = code;
      return response;
    }),
    json: mock((body: unknown) => {
      response.body = body;
      return response;
    }),
  };

  return response;
}
