import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {client} from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.accounts[":id"]["$delete"]>;
// type req ={
//     name:Number;
// }
export const useDeleteAccount = (id ? :string) =>{
    const queryClient = useQueryClient();

    const mutation = useMutation<
    ResponseType,// from line number 7 
    Error
    >({
        mutationFn: async()=>{
            const response = await client.api.accounts[":id"]["$delete"]({
                param:{id}
            });
            return await response.json();
        },
        onSuccess:()=>{
            toast.success("Account deleted");
            queryClient.invalidateQueries({queryKey: ["account",{id}]});
            queryClient.invalidateQueries({queryKey: ["accounts"]}); // by this line it will refetch all accounts every time i make a new acccount this will help in instent add of account on UI part
        },
        onError: ()=>{
            toast.error("Failed to Edit an account.");
        },
    });
    return mutation;
};