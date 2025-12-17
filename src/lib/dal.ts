import { prisma } from './db'
/* import { Role } from '@prisma/client' */

export async function getUserWorkspaces(userId: string) {
  try {
    // Se não tiver DB URL, já lança erro para cair no catch
    if (!process.env.DATABASE_URL) throw new Error("No DB URL")

    return await prisma.userWorkspace.findMany({
      where: { userId },
      include: {
        workspace: true
      }
    })
  } catch (error) {
    console.warn("Database inaccessible, returning mock workspace for DEV/MVP:", error)
    // Return a mock workspace structure
    return [{
      userId,
      workspaceId: 'mock-workspace-id',
      role: 'OWNER' as any,
      workspace: {
        id: 'mock-workspace-id',
        name: 'Workspace Demo',
        slug: 'workspace-demo',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }] as any
  }
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
          role: 'OWNER' // Role.OWNER
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
