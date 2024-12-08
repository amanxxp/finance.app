import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetAccounts = () => {
  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const token = localStorage.getItem("finance-token");
      const response = await client.api.accounts.$get({
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch account");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
