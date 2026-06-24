import { getUsers } from "../../lib/api";
import { UsersView } from "../../components/UsersView";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersView users={users} />;
}
