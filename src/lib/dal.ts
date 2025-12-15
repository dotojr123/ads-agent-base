import { prisma } from './db'
import { Role } from '@prisma/client'

export async function getUserWorkspaces(userId: string) {
  return await prisma.userWorkspace.findMany({
    where: { userId },
    include: { workspace: true }
  })
}

export async function checkWorkspaceAccess(userId: string, workspaceId: string) {
  return await prisma.userWorkspace.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  })
}
