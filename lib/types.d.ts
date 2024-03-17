export interface ExecutionOutput {
  message: string;
  result?: null | CodeResult;
  console: ConsoleMessage[];
  performance?: number;
  err?: null | ExecutionError;
}

export interface ExecutionError {
  name: string;
  message: string;
  stack?: string;
}

export type CodeResult = CodeResultSuccess | CodeResultError;

export interface CodeResultSuccess {
  value: string;
  err: null;
}

export interface CodeResultError {
  value: null;
  err: CodeError;
}

export interface CodeError {
  name: string;
  message: string;
  stack?: string;
  payload?: {
    actual: string;
    expected: string;
  };
}

export interface ConsoleMessage {
  type: "log";
  message: string;
}
