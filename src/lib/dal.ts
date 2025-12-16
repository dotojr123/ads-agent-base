import { prisma } from './db'
import { Role } from '@prisma/client'

export async function getUserWorkspaces(userId: string) {
  return await prisma.userWorkspace.findMany({
    where: { userId },
    include: {
      workspace: true
    }
  })
}

export async function createWorkspace(userId: string, name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000)

  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug,
      users: {
        create: {
          userId,
          role: Role.OWNER
        }
      },
      // Create a default free subscription
      subscription: {
        create: {
          status: 'ACTIVE',
          plan: 'STARTER'
        }
      }
    }
  })

  return workspace
}

export async function checkWorkspaceAccess(userId: string, workspaceId: string) {
  const access = await prisma.userWorkspace.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  })

  return access
}

export async function getWorkspaceSubscription(workspaceId: string) {
  return await prisma.subscription.findUnique({
    where: { workspaceId }
  })
}
