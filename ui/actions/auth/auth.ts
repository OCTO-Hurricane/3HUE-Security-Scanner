"use server";

import { AuthError } from "next-auth";
import { z } from "zod";

import { signIn, signOut } from "@/auth.config";
import { apiBaseUrl } from "@/lib";
import { authFormSchema } from "@/types";

const formSchemaSignIn = authFormSchema("sign-in");
const formSchemaSignUp = authFormSchema("sign-up");

const defaultValues: z.infer<typeof formSchemaSignIn> = {
  email: "",
  password: "",
};

export async function authenticate(
  prevState: unknown,
  formData: z.infer<typeof formSchemaSignIn>,
) {
  try {
    await signIn("credentials", {
      ...formData,
      redirect: false,
    });
    return {
      message: "Success",
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Credentials error",
            errors: {
              ...defaultValues,
              credentials: "Incorrect email or password",
            },
          };
        case "CallbackRouteError":
          return {
            message: error.cause?.err?.message,
          };
        default:
          return {
            message: "Unknown error",
            errors: {
              ...defaultValues,
              unknown: "Unknown error",
            },
          };
      }
    }
  }
}

export const createNewUser = async (
  formData: z.infer<typeof formSchemaSignUp>,
) => {
  // Debug: log apiBaseUrl
  console.log('apiBaseUrl:', apiBaseUrl);
  const baseUrl = apiBaseUrl || 'http://localhost:8080/api/v1';
  const url = new URL(`${baseUrl}/users`);

  if (formData.invitationToken) {
    url.searchParams.append("invitation_token", formData.invitationToken);
  }

  const bodyData = {
    data: {
      type: "users",
      attributes: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(formData.company && { company_name: formData.company }),
      },
    },
  };

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify(bodyData),
    });

    const parsedResponse = await response.json();
    if (!response.ok) {
      return parsedResponse;
    }

    return parsedResponse;
  } catch (error) {
    return {
      errors: [
        {
          source: { pointer: "" },
          detail: "Network error or server is unreachable",
        },
      ],
    };
  }
};

export const getToken = async (formData: z.infer<typeof formSchemaSignIn>) => {
  // Debug: log apiBaseUrl
  console.log('apiBaseUrl (sign in):', apiBaseUrl);
  const baseUrl = apiBaseUrl || 'http://localhost:8080/api/v1';
  const url = new URL(`${baseUrl}/tokens`);

  const bodyData = {
    data: {
      type: "tokens",
      attributes: {
        email: formData.email,
        password: formData.password,
      },
    },
  };

  try {
    // Add timeout to fetch
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify(bodyData),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const parsedResponse = await response.json();

    const accessToken = parsedResponse.data?.attributes?.access;
    const refreshToken = parsedResponse.data?.attributes?.refresh;
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "name" in error && (error as any).name === "AbortError") {
      throw new Error("Request timed out. Server is too slow or unreachable.");
    }
    throw new Error("Error in trying to get token");
  }
};

export const getUserByMe = async (accessToken: string) => {
  // Debug: log apiBaseUrl
  console.log('apiBaseUrl (getUserByMe):', apiBaseUrl);
  const baseUrl = apiBaseUrl || 'http://localhost:8080/api/v1';
  const url = new URL(`${baseUrl}/users/me?include=roles`);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const parsedResponse = await response.json();
    if (!response.ok) {
      // Handle different HTTP error codes
      switch (response.status) {
        case 401:
          throw new Error("Invalid or expired token");
        case 403:
          throw new Error(parsedResponse.errors?.[0]?.detail);
        case 404:
          throw new Error("User not found");
        default:
          throw new Error(
            parsedResponse.errors?.[0]?.detail || "Unknown error",
          );
      }
    }

    const userRole = parsedResponse.included?.find(
      (item: any) => item.type === "roles",
    );

    const permissions = {
      manage_users: userRole.attributes.manage_users || false,
      manage_account: userRole.attributes.manage_account || false,
      manage_providers: userRole.attributes.manage_providers || false,
      manage_scans: userRole.attributes.manage_scans || false,
      manage_integrations: userRole.attributes.manage_integrations || false,
      manage_billing: userRole.attributes.manage_billing || false,
      unlimited_visibility: userRole.attributes.unlimited_visibility || false,
    };

    return {
      name: parsedResponse.data.attributes.name,
      email: parsedResponse.data.attributes.email,
      company: parsedResponse.data.attributes.company_name,
      dateJoined: parsedResponse.data.attributes.date_joined,
      permissions,
    };
  } catch (error: any) {
    throw new Error(error.message || "Network error or server unreachable");
  }
};

export async function logOut() {
  await signOut();
}
