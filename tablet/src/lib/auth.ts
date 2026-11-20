import { graphqlRequest, UnauthorizedError } from "./graphql";

type LoginResponse = {
  login: {
    token: string;
  };
};

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
    }
  }
`;

export async function login(email: string, password: string): Promise<string> {
  const data = await graphqlRequest<LoginResponse>(LOGIN_MUTATION, {
    input: {
      email,
      password,
    },
  });

  return data.login.token;
}

export async function validateToken(token: string): Promise<boolean> {
  if (!token.trim()) {
    return false;
  }

  try {
    await graphqlRequest<{ __typename: string }>(
      "{ __typename }",
      undefined,
      token,
    );

    return true;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return false;
    }

    throw error;
  }
}
