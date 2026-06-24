import { getTasks, getUsers } from "../../lib/api";
import { TasksView } from "../../components/TasksView";

export default async function TasksPage() {
  const [tasks, users] = await Promise.all([getTasks(), getUsers()]);
  return <TasksView tasks={tasks} users={users} />;
}
