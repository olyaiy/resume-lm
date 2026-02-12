export interface AuthFormFieldErrors {
  email?: string[];
  password?: string[];
  name?: string[];
}

export interface AuthFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: AuthFormFieldErrors;
}

export const initialAuthFormState: AuthFormState = {
  status: "idle",
};
