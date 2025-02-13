import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../libs/prisma";

export async function createPoll(app: FastifyInstance): Promise<void> {
    app.post('/polls', async (req: FastifyRequest, reply: FastifyReply) => {
        const createPollBody = z.object({
            title: z.string().trim().min(1, "Poll must have a title"),
            options: z.array(z.string().trim()).min(1, "Poll must have at least one option"),
        });

        const result = createPollBody.safeParse(req.body);
        
        if (!result.success) {
            return reply.status(400).send({ message: result.error.errors });
        }

        const { title, options } = result.data;

        try {
            const poll = await prisma.poll.create({
                data: {
                    title,
                    options: {
                        create: options.map(option => ({ title: option })),
                    },
                },
            });

            return reply.status(201).send({
                pollId: poll.id,
                message: "Poll created successfully",
            });
        } catch (error) {
            console.error("Database error:", error);
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
