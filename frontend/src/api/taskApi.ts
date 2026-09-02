import api from "./api";
import type { Task } from "../types/Task";

interface TaskListResponse {
  success?: boolean;
  tasks?: Task[];
  data?: Task[];
}

interface TaskResponse {
  success?: boolean;
  task?: Task;
  data?: Task;
  id?: string;
  title?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

const extractTasks = (
  responseData: Task[] | TaskListResponse
): Task[] => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData.tasks)) {
    return responseData.tasks;
  }

  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }

  return [];
};

const extractTask = (
  responseData: Task | TaskResponse
): Task => {
  if ("task" in responseData && responseData.task) {
    return responseData.task;
  }

  if ("data" in responseData && responseData.data) {
    return responseData.data;
  }

  return responseData as Task;
};

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[] | TaskListResponse>(
    "/tasks"
  );

  return extractTasks(response.data);
};

export const addTask = async (
  title: string,
  dueDate?: string,
  priority?: "low" | "medium" | "high"
): Promise<Task> => {
  try {
    const response = await api.post<Task | TaskResponse>(
      "/tasks",
      {
        title,
        dueDate,
        priority,
      }
    );

    return extractTask(response.data);
  } catch (error: any) {
    if (error.response?.status === 409) {
      const message =
        error.response?.data?.message ||
        "A task with this title already exists.";

      throw new Error(message);
    }

    throw new Error(
      "Unable to create the task. Please try again."
    );
  }
};

export const updateTask = async (
  id: string,
  updates: {
    title?: string;
    completed?: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  }
): Promise<Task> => {
  const response = await api.put<Task | TaskResponse>(
    `/tasks/${id}`,
    updates
  );

  return extractTask(response.data);
};

export const toggleTask = async (
  id: string
): Promise<Task> => {
  const response = await api.patch<Task | TaskResponse>(
    `/tasks/${id}`
  );

  return extractTask(response.data);
};

export const deleteTask = async (
  id: string
): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};