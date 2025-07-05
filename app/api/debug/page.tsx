import prisma from "@/lib/prisma"
export default async function Debug() {
  const users = await prisma.users.findMany({})
  return (
    <div>
      <h1>Users:</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <div>
              <strong>ID:</strong> {user.id}
            </div>
            <div>
              <strong>Name:</strong>
              {user.name}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
