import type { ListingStatus } from "@/lib/types";

const STATUS_COPY: Record<ListingStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

const STATUS_CLASSES: Record<ListingStatus, string> = {
  available: "bg-status-available-bg text-status-available",
  reserved: "bg-status-reserved-bg text-status-reserved",
  sold: "bg-status-sold-bg text-status-sold",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${STATUS_CLASSES[status]}`}
    >
      {STATUS_COPY[status]}
    </span>
  );
}
