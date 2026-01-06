export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: number;
    fullName: string;
    email: string;
    role: string;
  };
}
