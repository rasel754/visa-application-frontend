import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-700">Page Not Found</h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Button asChild className="rounded-xl bg-blue-700 font-semibold hover:bg-blue-800">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
