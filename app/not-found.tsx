import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-900">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex justify-center">
             <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
                <FileQuestion className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Page Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/" passHref>
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
