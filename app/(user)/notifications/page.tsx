import { Eye, ChevronsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getNotifications, getOlderNotifications } from "./actions";
import { listNotification } from "@/utils/common";
import Link from "next/link";

export default async function Page() {
  const notifications = await getNotifications();
  const formattedNotifications = listNotification(notifications.projects);
  const history = await getOlderNotifications();

  return (
    <div className="max-w-screen mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold">Recents</h1>
      </div>
      {JSON.stringify(history)}
      {formattedNotifications &&
        formattedNotifications.map((notif) => (
          <Link
            key={notif.id}
            href={`/project/${notif.projectId}`}
            className="block"
          >
            <Card className="hover:bg-muted/40 transition">
              <CardContent className="flex items-center gap-4 px-4">
                <Avatar className="bg-muted">
                  <AvatarFallback>{notif.type[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  {notif.type === "upvote" && <ChevronsUp />}
                  {notif.type === "view" && <Eye />}
                  <p className={cn("text-lg text-foreground")}>
                    <span className="font-bold">
                      {notif.projectName.toUpperCase()}
                    </span>{" "}
                    got{" "}
                    <span className="text-primary font-bold">
                      {notif.count}
                    </span>{" "}
                    {notif.type}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
    </div>
  );
}
