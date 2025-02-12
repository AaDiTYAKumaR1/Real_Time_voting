import fastify from "fastify";
import { createPoll } from "./routes/createPoll";
import { getPolls } from "./routes/getPolls";
import { votePoll } from "./routes/votePoll";
import cookies from "@fastify/cookie";

const app=fastify();

app.register(cookies,{
    secret:"supersecretkey",
    hook:"onRequest",
})
app.register(createPoll);
app.register(getPolls);
app.register(votePoll);

app.listen({
    port: 3000,
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`server listening on ${address}`);
    
});