import http from "../http";

export const invoke = (data) => {
  return http({
    method: "post",
    url: "/chain/invoke",
    data,
  });
};

export const userLogin = (data) => {
  return http({
    method: "post",
    url: "/auth/login",
    data,
  });
};

export const getChatHistory = () => {
  return http({
    method: "get",
    url: "/chat-history",
  });
};

export const addChatHistory = (data) => {
  return http({
    method: "post",
    url: "/chat-history",
    data,
  });
};

export const addChatHistoryItem = (data) => {
  return http({
    method: "post",
    url: "/chat-history-item",
    data,
  });
};

export const getChatHistoryItem = (params) => {
  return http({
    method: "get",
    url: "/chat-history-item",
    params,
  });
};

export const refreshToken = () => {
  return http({
    method: "get",
    url: "/auth/refresh-token",
  });
};
