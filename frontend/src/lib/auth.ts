import { graphqlRequest } from "./graphql";

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
