import { Worker, Job } from 'bullmq'

/**
 * Standard BullMQ Worker Template
 * Includes: Error handling, logging, and concurrency control.
 */
export const createWorker = (queueName: string) => {
  const worker = new Worker(
    queueName,
    async (job: Job) => {
      console.log(`Processing job ${job.id} of type ${job.name}`)
      
      try {
        // Business logic here
        await processTask(job.data)
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error)
        throw error // Triggers retry logic
      }
    },
    {
      concurrency: 5,
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      }
    }
  )

  worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`)
  })

  worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`)
  })
  
  return worker
}

async function processTask(data: any) {
  // Implementation
}
