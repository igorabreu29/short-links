import request from "supertest";
import { app } from "@/app.ts";

type Method = "get" | "post" | "patch" | "put" | "delete";

export interface RequestGetAndDeleteProps {
  url: string;
  token?: string;
}

// Requests que usam body
export interface RequestPatchAndPutProps {
  url: string;
  body: Record<string, unknown>;
  token?: string;
}

export interface RequestPostProps {
  url: string;
  body: Record<string, unknown>;
  attach?: {
    attachExpectedName: string;
    attachUrl: string;
  };
  token?: string;
}

export type RequestProps<M extends Method> = M extends "get" | "delete"
  ? RequestGetAndDeleteProps
  : M extends "post"
    ? RequestPostProps
    : RequestPatchAndPutProps;

export function makeRequest<M extends Method = Method>(
  method: M,
  props: RequestProps<M>,
) {
  const requestTest = request(app.server)[method](props.url);

  if (["post", "patch", "put"].includes(method) && "body" in props) {
    requestTest.send(props.body);
  }

  if (["post"].includes(method) && "attach" in props && props.attach) {
    const { attachExpectedName, attachUrl } = props.attach;

    requestTest.attach(attachExpectedName, attachUrl);
  }

  if (props.token) {
    requestTest.set("Authorization", `Bearer ${props.token}`);
  }

  return requestTest;
}
