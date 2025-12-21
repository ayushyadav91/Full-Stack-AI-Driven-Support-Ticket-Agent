import { NonRetriableError } from "inngest";
import Ticket from "../../models/ticket.model.js"
import { sendEmail } from "../../utils/mailer.js";
import { inngest} from "../client.js";
import  analyzeTicket from "../../utils/agent.js"
import User from "../../models/user.model.js"


export const onTicketCreated = inngest.createFunction(
    {id:"on-ticket-created", retries:2},
    {event:"ticket/created"},

    async({event, step})=>{
        try{
            const {ticketId} = event.data;

//fetch ticket from DB
    //   const ticket = await Ticket.findById(ticketId);
    const ticket = await step.run("fetch-ticket", async()=>{
        const ticketObject = await Ticket.findById(ticketId);
        if(!ticket){
            throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
    });
    await step.run("update-ticket-status", async ()=>{
        await Ticket.findByIdUpdate(ticket._id,{
            status:"TODO"
        });
    })
 
    const aiResponse = await analyzeTicket(ticket);

    const relatedSkills =    await step.run("ai-processing", async()=>{
        let skills = [];
        if(aiResponse){
            await Ticket.findByIdAndUpdate(ticket._id,{
                priority: !["low","medium","hight"].includes(aiResponse.priority)?"medium":aiResponse.priority,
                helpfulNotes:aiResponse.helpfulNotes,
                status:"IN_PROGRESS",
                relatedSkills:aiResponse.relatedSkills
    })
     skills = aiResponse.relatedSkill 
  }  
  return skills
})
     
     const moderator = await step.run("assign-moderator", 
        async()=>{
            let user = await User.findOne({
                role:"moderator",
                skills:{
                    $elemMatch:{
                        $regex:relatedSkills.join("|"),
                        $options:"i"
                    }
                }
            });
            if(!user){
                user = await User.findOne({
                    role:"admin"
                });
            }
            await Ticket.findByIdAndUpdate(ticket._id,{
                assignedTo:user?._id || null
            })
            return user ;
        });

  await step.run("send-email-notification", async()=>{
          if(moderator){
            const finalTicket =  await Ticket.findById(ticket._id)
            await sendEmail(
                moderator.email,
                "Ticket Assigned",
                `A new ticket is assigned to you ${finalTicket.title}`
            )
          }
      })
 return {success:true};
     }catch(error){
        console.error("Error running on-ticket-create", err.message);
        return {success:false};
    }
         
    }
)