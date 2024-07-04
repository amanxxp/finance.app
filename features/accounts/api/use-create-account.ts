import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {client} from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.accounts.$post>;
type RequestType = InferRequestType<typeof client.api.accounts.$post>["json"]; // what is comming in request type i.e., json object
// can also do this instead because this only define the type
// type req ={
//     name:Number;
// }
export const useCreateAccount = () =>{
    const queryClient = useQueryClient();

    const mutation = useMutation<
    ResponseType,// from line number 7 
    Error,
    RequestType // from line number 8
    >({
        mutationFn: async(json)=>{
            const response = await client.api.accounts.$post({json});
            return await response.json();
        },
        onSuccess:()=>{
            toast.success("Account created");
            queryClient.invalidateQueries({queryKey: ["accounts"]}); // by this line it will refetch all accounts every time i make a new acccount this will help in instent add of account on UI part
        },
        onError: ()=>{
            toast.error("Failed to create an account.");
        },
    });
    return mutation;
};