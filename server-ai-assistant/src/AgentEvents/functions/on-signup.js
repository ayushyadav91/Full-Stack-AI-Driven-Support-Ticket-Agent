import { inngest } from "../client.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../services/mailer.js";

export const onUserSignUp = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        console.log("Fetched user for signup event:", userObject);
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in our database");
        }
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the app`;
        const message = `Hi,
            \n\n
            Thanks for signing up. We're glad to have you onboard!
            `;
        await sendEmail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running step", error.message);
      return { success: false };
    }
  }
);
