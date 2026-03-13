import { redirect } from "next/navigation";

export default function LegacyStudentOrderPage() {
  redirect("/student/new-order");
}
