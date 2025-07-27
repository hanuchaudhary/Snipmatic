import { z } from "zod";

export const subscriptionSchema = z.object({
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  street: z.string().min(1, "Street is required"),
  zipcode: z.string().min(1, "Zipcode is required"),
});
