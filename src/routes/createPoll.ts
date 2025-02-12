import { FastifyInstance } from "fastify";
import { object,array,string } from "zod";
import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../libs/prisma";


export async function createPoll(app:FastifyInstance):Promise<void>{
    app.post('/polls',async(req:FastifyRequest,reply:FastifyReply)=>{
    console.log(req.body);
    const createPollBody=object({
        title: string().trim(),
        options: array(
            string().trim()
        ),
    })
    const {title,options}= createPollBody.parse(req.body);
        const poll= await prisma.poll.create({
       data:{
        title: "My first poll",
        options: {
           createMany:{
            data:options.map(option=>({title:option}))
           }
        },
       }
    })
    return reply.status(201).send({ pollId: poll.id });
})
}