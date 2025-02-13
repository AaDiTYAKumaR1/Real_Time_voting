import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "crypto";
import { prisma } from "../libs/prisma";
import { z } from "zod";

export async function votePoll(app: FastifyInstance): Promise<void> {
  app.post("/poll/:pollId/vote", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const votePollParams = z.object({
        pollId: z.string().trim(),
      });

      const parsedParams = votePollParams.safeParse(req.params);
      if (!parsedParams.success) {
        return reply.status(400).send({ message: "Invalid poll ID" });
      }
      const { pollId } = parsedParams.data;

      const votePollBody = z.object({
        pollOptionId: z.string().trim(),
      });

      const parsedBody = votePollBody.safeParse(req.body);
      if (!parsedBody.success) {
        return reply.status(400).send({ message: "Invalid poll option ID" });
      }
      const { pollOptionId } = parsedBody.data;

      let sessionId = req.cookies?.sessionId;

      const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: { options: true },
      });

      if (!poll) {
        return reply.status(404).send({ message: "Poll not found" });
      }

      if (!poll.options.some((option) => option.id === pollOptionId)) {
        return reply.status(400).send({ message: "Invalid poll option" });
      }

      console.log("Session ID:", sessionId);

      if (sessionId) {
        const previousVote = await prisma.votes.findFirst({
          where: { sessionId, pollId },
        });

        if (previousVote) {
          return reply.status(400).send({ message: "You have already voted on this poll!" });
        }
      } else {
        sessionId = randomUUID();
        reply.setCookie("sessionId", sessionId, {
          path: "/",
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, 
          signed: true,
        });
      }

      await prisma.votes.create({
        data: {
          sessionId,
          pollId,
          optionId: pollOptionId,
        },
      });

      return reply.status(201).send({ message: "You have successfully voted on this poll!" });

    } catch (error) {
      console.error("Error voting:", error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });
}
