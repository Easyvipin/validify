import { Bell, ThumbsUp, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "upvote",
    project: "DevHub",
    count: 100,
    icon: <ThumbsUp className="h-5 w-5 text-green-500" />,
  },
  {
    id: 2,
    type: "views",
    project: "Designify",
    count: 1000,
    icon: <Eye className="h-5 w-5 text-blue-500" />,
  },
  {
    id: 3,
    type: "upvote",
    project: "AI Assistant",
    count: 250,
    icon: <ThumbsUp className="h-5 w-5 text-green-500" />,
  },
];

export default function Page() {
  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <h1 className="text-xl font-semibold">Notifications</h1>
      </div>

      {notifications.map((notif) => (
        <Card key={notif.id} className="hover:bg-muted/40 transition">
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="bg-muted">
              <AvatarFallback>{notif.type[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              {notif.icon}
              <p className={cn("text-sm text-foreground")}>
                Your project{" "}
                <span className="font-semibold">{notif.project}</span> got{" "}
                <span className="text-primary font-bold">{notif.count}</span>{" "}
                {notif.type}.
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
