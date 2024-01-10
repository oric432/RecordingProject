import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recordingsFetch } from "../utils";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

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
      if (!recording?.name) {
        toast.error("name is undefined");
        throw new Error("name is undefined");
      }

      const newRecording = await recordingsFetch.post("/", { ...recording });

      const socket = io("http://10.0.0.39:3002", {
        query: { type: "frontend" },
      });
      socket.emit("savedToDb", { saved: true });

      return newRecording;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["recordings"]);
      toast.success("recording added successfully");
    },
    onError: (error) => {
      console.log(error.response.data.msg);
      toast.error(`Error: ${error.response.data.msg}`);
    },
  });

  return { addRecording, isLoading };
};

export const useFetchRecording = (obj) => {
  const { isLoading, error, data } = useQuery({
    queryKey: obj ? ["recording", obj.id] : [],
    queryFn: async () => {
      const response = await recordingsFetch.get(`/${obj.id}`);
      return response.data;
    },
  });

  return { isLoading, error, data };
};
