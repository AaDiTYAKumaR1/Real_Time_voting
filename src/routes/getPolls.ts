import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { prisma } from "../libs/prisma";

export async function getPolls(app: FastifyInstance): Promise<void> {
    app.get('/polls/:pollId', async (req: FastifyRequest, reply: FastifyReply) => {
        const getPollParams = z.object({
            pollId: z.string().trim(),
        });

        // Validate pollId
        const result = getPollParams.safeParse(req.params);
        if (!result.success) {
            return reply.status(400).send({ message: "Invalid poll ID" });
        }

        const { pollId } = result.data;

        try {
            const poll = await prisma.poll.findUnique({
                where: { id: pollId },
                include: {
                    options: {
                        select: {
                            id: true,
                            title: true
                        },
                    },
                },
            });

            if (!poll) {
                return reply.status(404).send({ message: "Poll not found" });
            }

            return reply.status(200).send({ poll });

        } catch (error) {
            console.error("Database error:", error);
            return reply.status(500).send({ message: "Internal Server Error" });
        }
    });
}
