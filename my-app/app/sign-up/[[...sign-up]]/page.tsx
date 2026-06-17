import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F1EA] px-4">
      <SignUp routing="path" path="/sign-up" />
    </main>
  );
}
