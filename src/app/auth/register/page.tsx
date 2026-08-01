import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/auth/login?next=%2Fhome");
}
