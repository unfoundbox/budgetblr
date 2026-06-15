import { listUpcomingEvents } from "@/lib/queries/spots";
import EventsView from "@/components/EventsView";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await listUpcomingEvents();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <EventsView events={events} />
    </div>
  );
}
