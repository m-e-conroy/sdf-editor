import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

/**
 * Interactive Transaction Example
 * Use when updates depend on results of previous queries in the same transaction.
 */
export async function transferFunds(fromId: string, toId: string, amount: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. Decrement sender
    const sender = await tx.user.update({
      data: { balance: { decrement: amount } },
      where: { id: fromId },
    })

    // 2. Verify sufficient funds
    if (sender.balance < 0) {
      throw new Error(`${fromId} has insufficient funds`)
    }

    // 3. Increment recipient
    const recipient = await tx.user.update({
      data: { balance: { increment: amount } },
      where: { id: toId },
    })

    return { sender, recipient }
  })
}
