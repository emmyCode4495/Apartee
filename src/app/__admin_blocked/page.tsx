import { notFound } from "next/navigation";

/** Hit only via middleware rewrite when someone visits /admin — looks like a 404. */
export default function AdminBlockedPage() {
  notFound();
}
