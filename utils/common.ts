import { getListOfNotifications } from "@/app/(user)/notifications/actions";

type ListType = Awaited<ReturnType<typeof getListOfNotifications>>;

export function listNotification(list: ListType) {
  return list?.map((project) => {
    let message = `${project.projectName} got ${project.count} ${project.type}`;
    return {
      projectId: project.projectId,
      projectName: project.projectName,
      count: project.count,
      message,
      type: project.type,
    };
  });
}
