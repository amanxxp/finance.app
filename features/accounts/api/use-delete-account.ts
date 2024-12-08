import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["$delete"]
>;

export const useDeleteAccount = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const token = localStorage.getItem("finance-token"); // Get the token dynamically

      // Send the DELETE request with the Authorization header
      const response = await client.api.accounts[":id"]["$delete"](
        {
          param: { id },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the Authorization header
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete account.");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account deleted");
      queryClient.invalidateQueries({ queryKey: ["account", { id }] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: () => {
      toast.error("Failed to delete account.");
    },
  });

  return mutation;
};
