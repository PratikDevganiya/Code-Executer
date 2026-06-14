import axios from "../config/axios";

const requestAssistantHelp = async (payload) => {
  const response = await axios.post("/code/assistant", payload);
  return response.data;
};

export default {
  requestAssistantHelp,
};
