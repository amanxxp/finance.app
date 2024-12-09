import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetCategory = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["category", { id }],
    queryFn: async () => {
      const token = localStorage.getItem("finance-token");
      const response = await client.api.categories[":id"].$get(
        {
          param: { id },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch category.");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
