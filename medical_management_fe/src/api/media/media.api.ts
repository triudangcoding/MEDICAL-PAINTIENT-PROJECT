import { axiosInstance } from "../axios";

export const mediaApi = {
  uploadAudio: (file: File, meetingScheduleId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post(
      `http://localhost:9944/api/media/upload/${meetingScheduleId}`,
      formData
    );
  },
};
