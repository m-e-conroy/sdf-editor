import DataLoader from 'dataloader'

/**
 * Standard DataLoader Pattern
 * Batches multiple single-record fetches into a single batch query.
 */
export const createUserLoader = (db: any) => {
  return new DataLoader(async (userIds: readonly string[]) => {
    // Batch query: SELECT * FROM users WHERE id IN (...)
    const users = await db.user.findMany({
      where: { id: { in: [...userIds] } }
    })

    // Map back to the exact order of userIds
    const userMap = new Map(users.map(u => [u.id, u]))
    return userIds.map(id => userMap.get(id) || null)
  })
}

// Usage in Resolver:
// const user = await context.loaders.user.load(parent.authorId)
