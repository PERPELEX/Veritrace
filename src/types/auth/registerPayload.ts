export default interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: "client" | "admin" | "analyst";
}
