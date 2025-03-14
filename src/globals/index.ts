import { refreshToken } from "./../network/api/chat";
import { userLogin } from "../network/api/chat";
import jsCookie from "js-cookie";

export const authLogin = async (params) => {
  //   const data = await userLogin({ ...params });
  const data = await userLogin({ username: "admin", password: "123456" });
  if (data.code === 200) {
    console.log(data);
    jsCookie.set("authorization", data.data.accessToken);
    jsCookie.set("refresh-token", data.data.refreshToken);
  }
};

export const refreshTokenRequest = async () => {
  const data = await refreshToken();
  if (data.code === 200) {
    const { accessToken, refreshToken } = data.data;
    jsCookie.set("authorization", accessToken);
    jsCookie.set("refresh-token", refreshToken);
  }
};
