import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { string,object } from "zod";
import { prisma } from "../libs/prisma";
export async function getPolls(app:FastifyInstance):Promise<void>{
    app.get('/polls/:pollId',async(req:FastifyRequest,reply:FastifyReply)=>{
        console.log(req.params);
        const getPollParams = object({
            pollId: string().trim(),
          });
        const {pollId}=req.params;
        const polls=await prisma.poll.findUnique(
            {
                where:
                {
                    id:pollId           
                },
                include:{
                    options:{
                        select:{
                            id:true,
                            title:true
                        },
                    },
                },
            });
        if(!polls){
            return reply.status(404).send({message:"Poll not found"});
        }

        return reply.status(200).send({polls})
    })
}