import { AxiosError } from "axios";

interface ApiErrorResponse {
  message: string;
  status?: number;
  code?: string;
  details?: string;
}

export type AxiosErrorType = AxiosError<ApiErrorResponse>;
