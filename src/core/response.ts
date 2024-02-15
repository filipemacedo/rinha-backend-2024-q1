export type Response<T> = {
  statusCode: number;
  body: T;
};

export function badRequest(error: Error): Response<Error> {
  return {
    statusCode: 400,
    body: error,
  };
}

export function serverError(error: Error): Response<Error> {
  return {
    statusCode: 500,
    body: error,
  };
}

export function ok<T>(data: T): Response<T> {
  return {
    statusCode: 200,
    body: data,
  };
}

export function notFound(error: Error): Response<Error> {
  return {
    statusCode: 404,
    body: error,
  };
}

export function unproucessableEntity(error: Error): Response<Error> {
  return {
    statusCode: 422,
    body: error,
  };
}
