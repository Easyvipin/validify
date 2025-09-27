import { Eye, ChevronsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getNotificationsCount, getListOfNotifications } from "./actions";
import { listNotification } from "@/utils/common";
import Link from "next/link";

export default async function Page() {
  const notificationsCount = await getNotificationsCount();
  const notifications = await getListOfNotifications();
  const formattedNotifications = listNotification(notifications);

  return (
    <div className="max-w-screen mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-semibold">
          Recents ({notificationsCount})
        </h1>
      </div>
      {formattedNotifications &&
        formattedNotifications.map((notif) => (
          <Link
            key={`${notif.projectId + notif.type}`}
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
