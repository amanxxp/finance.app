import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.accounts.$post>;
type RequestType = InferRequestType<typeof client.api.accounts.$post>["json"];

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const token = localStorage.getItem("finance-token"); // Retrieve token from localStorage

      // Send the POST request with the Authorization header
      const response = await client.api.accounts.$post(
        { json },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach Bearer token
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create an account.");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account created");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: () => {
      toast.error("Failed to create an account.");
    },
  });
  
  return mutation;
};
