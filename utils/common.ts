import { getNotifications } from "@/app/(user)/notifications/actions";

type ListType = Awaited<ReturnType<typeof getNotifications>>["projects"];

export function listNotification(list: ListType) {
  return list?.map((project) => {
    let message = `${project.projectName} got ${project.unreadCount} ${project.type}`;
    return {
      id: project.id,
      projectId: project.projectId,
      projectName: project.projectName,
      count: project.unreadCount,
      message,
      type: project.type,
    };
  });
}
