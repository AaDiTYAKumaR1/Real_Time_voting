import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "crypto";
import { prisma } from "../libs/prisma";
import { object, string } from "zod";

export async function votePoll(app: FastifyInstance): Promise<void> {
  app.post("/poll/:pollId/vote", async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const votePollParams = object({
        pollId: string().trim(),
      });
      const { pollId } = votePollParams.parse(req.params);

      const votePollBody = object({
        pollOptionId: string().trim(),
      });
      const { pollOptionId } = votePollBody.parse(req.body);

      let sessionId = req.cookies.sessionId;

      const poll = await prisma.poll.findUnique({
        where: {
          id: pollId,
        },
        include: {
          options: true,
        },
      });

      if (!poll) {
        return reply.status(404).send({ message: "Poll not found" });
      }

      if (!poll.options.some((option) => option.id === pollOptionId)) {
        return reply.status(400).send({ message: "Invalid poll option" });
      }

      if (poll.options.length === 1 && poll.options[0].id === pollOptionId) {
        return reply.status(400).send({ message: "You cannot vote for the only option" });
      }

      console.log(sessionId);
      if (sessionId) {
        const previousVote = await prisma.votes.findUnique({
          where: {
            sessionId_pollId: {
              sessionId,
              pollId,
            },
          },
        });
        // console.log(previousVote)

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

      return reply.status(201).send(
       {
         "message": "You have successfully voted on this poll!"
       }
      );
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ message: "Internal Server Error" });
    }
  });
}
