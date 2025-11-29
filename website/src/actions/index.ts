import { defineAction } from "astro:actions";
import { RESEND_API_KEY } from "astro:env/server";
import { z } from "astro:schema";
import { Resend } from "resend";

export const server = {
  submitContact: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(1),
    }),
    handler: async (input) => {
      console.log("Received contact form submission:", input);
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: "Tracktrip <contract@tracktrip.app>",
        replyTo: `${input.name} <${input.email}>`,
        to: "alexistacnet@gmail.com",
        subject: "New message on Tracktrip",
        text: input.message,
      });
    },
  }),
};
