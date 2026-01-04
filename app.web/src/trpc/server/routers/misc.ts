import { Resend } from "resend";
import z from "zod";

import { authedProcedure, router } from "../trpc";

import { env } from "@/env";

export const miscRouter = router({
  sendMessage: authedProcedure
    .input(
      z.object({
        type: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const resend = new Resend(env.RESEND_API_KEY);

      const name = ctx.session.user.name;
      const email = ctx.session.user.email;
      await resend.emails.send({
        from: "Tracktrip <contact@notifications.tracktrip.app>",
        replyTo: `${name} <${email}>`,
        to: ["alexistacnet@gmail.com"],
        subject: "Message from Tracktrip app",
        text: `Type: ${input.type}\n\n${input.message}`,
      });
    }),
});
