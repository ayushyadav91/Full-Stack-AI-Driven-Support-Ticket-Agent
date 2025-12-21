import { NonRetriableError } from "inngest";
import User  from "../../models/user.model.js";
import { sendEmail } from "../../utils/mailer.js";
import { inngest} from "../client.js";


export const onUserSignUp = inngest.createFunction(
    { id:"on-user-signup",retrise:2},
    {event:"/user/signup"},
    async ({event,step}) => {
          try{
            const {email} = event.data;
            await step.run("get-User-email", async () => {
              const userObject = await User.findOne({email});
              if(!userObject){
               throw new NonRetriableError("User no longer exits in our database");
              }
                return userObject;
            });
            await step.run("send-welcome-email", async () => {
            const subject = `Welcome to AI Assistant Ticketing System`;
            const message=`Hello,
            \n\nThank you for signing up for the AI Assistant Ticketing System. We're excited to have you on board!
            \n\nBest regards,
            \nAI Assistant Ticketing System Team`;
            // await sendEmail(email,subject,message); --- IGNORE ---
            await sendEmail(email,subject,message);
            });
            
            return { success: true }; 
          } catch (error) {
            console.error("Error:", error);
          }
    });
