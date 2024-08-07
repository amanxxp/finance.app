import { useQuery } from "@tanstack/react-query";

import {client} from "@/lib/hono"; //for RPC connection

export const useGetAccount = (id? : string) => {
    const query = useQuery({
        enabled : !!id,
        queryKey:["account", { id}],
        queryFn: async () =>{
            const response = await client.api.accounts[":id"].$get({
                param :{id}
            }); // here using this instead of fetch("/api/accounts") this is bcz we are using rpc here 
            if(!response.ok){
                throw new Error("Failed to fetch account");
            }
            const {data} = await response.json();
            return data;
        },
    });
    return query;
};