import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().uuid("Invalid product"),
  rating: z.coerce
    .number({ message: "Choose a star rating" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating can be at most 5 stars"),
  comment: z
    .string()
    .trim()
    .max(2000, "Review is too long (max 2000 characters)")
    .optional()
    .or(z.literal("")),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export type ReviewResult =
  | { success: true }
  | { success: false; message: string };

export const supportMessageSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  subject: z
    .string()
    .trim()
    .min(3, "Subject is too short")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Message is too short")
    .max(5000, "Message is too long"),
});

export type SupportMessageInput = z.infer<typeof supportMessageSchema>;

export type SupportMessageResult =
  | { success: true }
  | { success: false; message: string };
