import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recordingsFetch } from "../utils";
import { toast } from "react-toastify";

export const useFetchRecordings = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["recordings"],
    queryFn: async () => {
      const response = await recordingsFetch.get("/");
      return response.data.data;
    },
  });

  return { isLoading, error, data };
};

export const useAddRecording = () => {
  const queryClient = useQueryClient();

  const { mutate: addRecording, isLoading } = useMutation({
    mutationFn: async (recording) => {
      console.log(recording);
      if (!recording.name) {
        toast.error("name is undefined");
        throw new Error("name is undefined");
      }

      const newRecording = await recordingsFetch.post("/", { ...recording });

      return newRecording;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recordings"]);
      toast.success("recording added successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(`Error: ${error.response.data.msg}`);
    },
  });

  return { addRecording, isLoading };
};
